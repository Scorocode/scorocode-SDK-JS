'use strict';
/*
 * https://github.com/mongodb/js-bson/blob/master/alternate_parsers/faster_bson.js
 * */

Object.defineProperty(exports, "__esModule", {
    value: true
});
function Timestamp(low, high) {
    this._bsontype = 'Timestamp';
    this.low_ = low | 0;this.high_ = high | 0; /// force into 32 signed bits.
}
Timestamp.prototype.getLowBits = function () {
    return this.low_;
};
Timestamp.prototype.getHighBits = function () {
    return this.high_;
};

function MinKey() {
    this._bsontype = 'MinKey';
} /// these are merely placeholders/stubs to signify the type!?

function MaxKey() {
    this._bsontype = 'MaxKey';
}

function deserializeFast(buffer, i, isArray) {
    //// , options, isArray) {       //// no more options!
    if (buffer.length < 5) return new Error('Corrupt bson message < 5 bytes long'); /// from 'throw'
    var elementType,
        tempindex = 0,
        name;
    var string, low, high; /// = lowBits / highBits
    /// using 'i' as the index to keep the lines shorter:
    i || (i = 0); /// for parseResponse it's 0; set to running index in deserialize(object/array) recursion
    var object = isArray ? [] : {}; /// needed for type ARRAY recursion later!
    var size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
    if (size < 5 || size > buffer.length) return new Error('Corrupt BSON message');
    /// 'size' var was not used by anything after this, so we can reuse it

    while (true) {
        // While we have more left data left keep parsing
        elementType = buffer[i++]; // Read the type
        if (elementType === 0) break; // If we get a zero it's the last byte, exit

        tempindex = i; /// inlined readCStyleString & removed extra i<buffer.length check slowing EACH loop!
        while (buffer[tempindex] !== 0x00) {
            tempindex++;
        } /// read ahead w/out changing main 'i' index
        if (tempindex >= buffer.length) return new Error('Corrupt BSON document: illegal CString');
        name = buffer.toString('utf8', i, tempindex);
        i = tempindex + 1; /// Update index position to after the string + '0' termination

        switch (elementType) {

            case 7:
                /// = BSON.BSON_DATA_OID:
                var buf = new Buffer(12);
                buffer.copy(buf, 0, i, i += 12); /// copy 12 bytes from the current 'i' offset into fresh Buffer
                object[name] = new ObjectID(buf); ///... & attach to the new ObjectID instance
                break;

            case 2:
                /// = BSON.BSON_DATA_STRING:
                size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                object[name] = buffer.toString('utf8', i, i += size - 1);
                i++;break; /// need to get the '0' index "tick-forward" back!

            case 16:
                /// = BSON.BSON_DATA_INT:        // Decode the 32bit value
                object[name] = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;break;

            case 1:
                /// = BSON.BSON_DATA_NUMBER:     // Decode the double value
                object[name] = buffer.readDoubleLE(i); /// slightly faster depending on dec.points; a LOT cleaner
                /// OLD: object[name] = readIEEE754(buffer, i, 'little', 52, 8);
                i += 8;break;

            case 8:
                /// = BSON.BSON_DATA_BOOLEAN:
                object[name] = buffer[i++] == 1;break;

            case 6: /// = BSON.BSON_DATA_UNDEFINED:     /// deprecated
            case 10:
                /// = BSON.BSON_DATA_NULL:
                object[name] = null;break;

            case 4:
                /// = BSON.BSON_DATA_ARRAY
                size = buffer[i] | buffer[i + 1] << 8 | buffer[i + 2] << 16 | buffer[i + 3] << 24; /// NO 'i' increment since the size bytes are reread during the recursion!
                object[name] = deserializeFast(buffer, i, true); /// pass current index & set isArray = true
                i += size;break;
            case 3:
                /// = BSON.BSON_DATA_OBJECT:
                size = buffer[i] | buffer[i + 1] << 8 | buffer[i + 2] << 16 | buffer[i + 3] << 24;
                object[name] = deserializeFast(buffer, i, false); /// isArray = false => Object
                i += size;break;

            case 5:
                /// = BSON.BSON_DATA_BINARY:             // Decode the size of the binary blob
                size = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                buffer[i++]; /// Skip, as we assume always default subtype, i.e. 0!
                object[name] = buffer.slice(i, i += size); /// creates a new Buffer "slice" view of the same memory!
                break;

            case 9:
                /// = BSON.BSON_DATA_DATE:      /// SEE notes below on the Date type vs. other options...
                low = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                high = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                object[name] = new Date(high * 4294967296 + (low < 0 ? low + 4294967296 : low));break;

            case 18:
                /// = BSON.BSON_DATA_LONG:  /// usage should be somewhat rare beyond parseResponse() -> cursorId, where it is handled inline, NOT as part of deserializeFast(returnedObjects); get lowBits, highBits:
                low = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                high = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;

                size = high * 4294967296 + (low < 0 ? low + 4294967296 : low); /// from long.toNumber()
                if (size < JS_INT_MAX && size > JS_INT_MIN) object[name] = size; /// positive # more likely!
                else object[name] = new Long(low, high);break;

            case 127:
                /// = BSON.BSON_DATA_MIN_KEY:   /// do we EVER actually get these BACK from MongoDB server?!
                object[name] = new MinKey();break;
            case 255:
                /// = BSON.BSON_DATA_MAX_KEY:
                object[name] = new MaxKey();break;

            case 17:
                /// = BSON.BSON_DATA_TIMESTAMP:   /// somewhat obscure internal BSON type; MongoDB uses it for (pseudo) high-res time timestamp (past millisecs precision is just a counter!) in the Oplog ts: field, etc.
                low = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                high = buffer[i++] | buffer[i++] << 8 | buffer[i++] << 16 | buffer[i++] << 24;
                object[name] = new Timestamp(low, high);break;

            ///        case 11:    /// = RegExp is skipped; we should NEVER be getting any from the MongoDB server!?
        } /// end of switch(elementType)
    } /// end of while(1)
    return object; // Return the finalized object
}

exports.deserializeFast = deserializeFast;