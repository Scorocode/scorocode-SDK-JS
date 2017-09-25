(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Scorocode = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

function init () {
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }

  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63
}

init()

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (process,__filename){

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , dirname = path.dirname
  , exists = fs.existsSync || path.existsSync
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }
  opts.__proto__ = defaults

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? require.resolve(n) : require(n)
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

}).call(this,require('_process'),"/node_modules/bindings/bindings.js")
},{"_process":3,"fs":undefined,"path":undefined}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; i++) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  that.write(string, encoding)
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

function arrayIndexOf (arr, val, byteOffset, encoding) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var foundIndex = -1
  for (var i = 0; byteOffset + i < arrLength; i++) {
    if (read(arr, byteOffset + i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
      if (foundIndex === -1) foundIndex = i
      if (i - foundIndex + 1 === valLength) return (byteOffset + foundIndex) * indexSize
    } else {
      if (foundIndex !== -1) i -= i - foundIndex
      foundIndex = -1
    }
  }
  return -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  if (Buffer.isBuffer(val)) {
    // special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(this, val, byteOffset, encoding)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset, encoding)
  }

  throw new TypeError('val must be string, number or Buffer')
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; i++) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; i++) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":1,"ieee754":8,"isarray":5}],5:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],6:[function(require,module,exports){
'use strict';

/*!
 * bufferutil: WebSocket buffer utils
 * Copyright(c) 2015 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

module.exports.BufferUtil = {
  merge: function(mergedBuffer, buffers) {
    for (var i = 0, offset = 0, l = buffers.length; i < l; ++i) {
      var buf = buffers[i];

      buf.copy(mergedBuffer, offset);
      offset += buf.length;
    }
  },

  mask: function(source, mask, output, offset, length) {
    var maskNum = mask.readUInt32LE(0, true)
      , i = 0
      , num;

    for (; i < length - 3; i += 4) {
      num = maskNum ^ source.readUInt32LE(i, true);

      if (num < 0) num = 4294967296 + num;
      output.writeUInt32LE(num, offset + i, true);
    }

    switch (length % 4) {
      case 3: output[offset + i + 2] = source[i + 2] ^ mask[2];
      case 2: output[offset + i + 1] = source[i + 1] ^ mask[1];
      case 1: output[offset + i] = source[i] ^ mask[0];
    }
  },

  unmask: function(data, mask) {
    var maskNum = mask.readUInt32LE(0, true)
      , length = data.length
      , i = 0
      , num;

    for (; i < length - 3; i += 4) {
      num = maskNum ^ data.readUInt32LE(i, true);

      if (num < 0) num = 4294967296 + num;
      data.writeUInt32LE(num, i, true);
    }

    switch (length % 4) {
      case 3: data[i + 2] = data[i + 2] ^ mask[2];
      case 2: data[i + 1] = data[i + 1] ^ mask[1];
      case 1: data[i] = data[i] ^ mask[0];
    }
  }
};

},{}],7:[function(require,module,exports){
'use strict';

try {
  module.exports = require('bindings')('bufferutil');
} catch (e) {
  module.exports = require('./fallback');
}

},{"./fallback":6,"bindings":2}],8:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],9:[function(require,module,exports){
/*!
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var fs = require('fs');

function Options(defaults) {
  var internalValues = {};
  var values = this.value = {};
  Object.keys(defaults).forEach(function(key) {
    internalValues[key] = defaults[key];
    Object.defineProperty(values, key, {
      get: function() { return internalValues[key]; },
      configurable: false,
      enumerable: true
    });
  });
  this.reset = function() {
    Object.keys(defaults).forEach(function(key) {
      internalValues[key] = defaults[key];
    });
    return this;
  };
  this.merge = function(options, required) {
    options = options || {};
    if (Object.prototype.toString.call(required) === '[object Array]') {
      var missing = [];
      for (var i = 0, l = required.length; i < l; ++i) {
        var key = required[i];
        if (!(key in options)) {
          missing.push(key);
        }
      }
      if (missing.length > 0) {
        if (missing.length > 1) {
          throw new Error('options ' +
            missing.slice(0, missing.length - 1).join(', ') + ' and ' +
            missing[missing.length - 1] + ' must be defined');
        }
        else throw new Error('option ' + missing[0] + ' must be defined');
      }
    }
    Object.keys(options).forEach(function(key) {
      if (key in internalValues) {
        internalValues[key] = options[key];
      }
    });
    return this;
  };
  this.copy = function(keys) {
    var obj = {};
    Object.keys(defaults).forEach(function(key) {
      if (keys.indexOf(key) !== -1) {
        obj[key] = values[key];
      }
    });
    return obj;
  };
  this.read = function(filename, cb) {
    if (typeof cb == 'function') {
      var self = this;
      fs.readFile(filename, function(error, data) {
        if (error) return cb(error);
        var conf = JSON.parse(data);
        self.merge(conf);
        cb();
      });
    }
    else {
      var conf = JSON.parse(fs.readFileSync(filename));
      this.merge(conf);
    }
    return this;
  };
  this.isDefined = function(key) {
    return typeof values[key] != 'undefined';
  };
  this.isDefinedAndNonNull = function(key) {
    return typeof values[key] != 'undefined' && values[key] !== null;
  };
  Object.freeze(values);
  Object.freeze(this);
}

module.exports = Options;

},{"fs":undefined}],10:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

/**
 * An auto incrementing id which we can use to create "unique" Ultron instances
 * so we can track the event emitters that are added through the Ultron
 * interface.
 *
 * @type {Number}
 * @private
 */
var id = 0;

/**
 * Ultron is high-intelligence robot. It gathers intelligence so it can start improving
 * upon his rudimentary design. It will learn from your EventEmitting patterns
 * and exterminate them.
 *
 * @constructor
 * @param {EventEmitter} ee EventEmitter instance we need to wrap.
 * @api public
 */
function Ultron(ee) {
  if (!(this instanceof Ultron)) return new Ultron(ee);

  this.id = id++;
  this.ee = ee;
}

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.on = function on(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.on(event, fn, context);

  return this;
};
/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.once = function once(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.once(event, fn, context);

  return this;
};

/**
 * Remove the listeners we assigned for the given event.
 *
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.remove = function remove() {
  var args = arguments
    , event;

  //
  // When no event names are provided we assume that we need to clear all the
  // events that were assigned through us.
  //
  if (args.length === 1 && 'string' === typeof args[0]) {
    args = args[0].split(/[, ]+/);
  } else if (!args.length) {
    args = [];

    for (event in this.ee._events) {
      if (has.call(this.ee._events, event)) args.push(event);
    }
  }

  for (var i = 0; i < args.length; i++) {
    var listeners = this.ee.listeners(args[i]);

    for (var j = 0; j < listeners.length; j++) {
      event = listeners[j];

      //
      // Once listeners have a `listener` property that stores the real listener
      // in the EventEmitter that ships with Node.js.
      //
      if (event.listener) {
        if (event.listener.__ultron !== this.id) continue;
        delete event.listener.__ultron;
      } else {
        if (event.__ultron !== this.id) continue;
        delete event.__ultron;
      }

      this.ee.removeListener(args[i], event);
    }
  }

  return this;
};

/**
 * Destroy the Ultron instance, remove all listeners and release all references.
 *
 * @returns {Boolean}
 * @api public
 */
Ultron.prototype.destroy = function destroy() {
  if (!this.ee) return false;

  this.remove();
  this.ee = null;

  return true;
};

//
// Expose the module.
//
module.exports = Ultron;

},{}],11:[function(require,module,exports){
'use strict';

/*!
 * UTF-8 validate: UTF-8 validation for WebSockets.
 * Copyright(c) 2015 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

module.exports.Validation = {
  isValidUTF8: function(buffer) {
    return true;
  }
};

},{}],12:[function(require,module,exports){
'use strict';

try {
  module.exports = require('bindings')('validation');
} catch (e) {
  module.exports = require('./fallback');
}

},{"./fallback":11,"bindings":2}],13:[function(require,module,exports){
'use strict';

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var WS = module.exports = require('./lib/WebSocket');

WS.Server = require('./lib/WebSocketServer');
WS.Sender = require('./lib/Sender');
WS.Receiver = require('./lib/Receiver');

/**
 * Create a new WebSocket server.
 *
 * @param {Object} options Server options
 * @param {Function} fn Optional connection listener.
 * @returns {WS.Server}
 * @api public
 */
WS.createServer = function createServer(options, fn) {
  var server = new WS.Server(options);

  if (typeof fn === 'function') {
    server.on('connection', fn);
  }

  return server;
};

/**
 * Create a new WebSocket connection.
 *
 * @param {String} address The URL/address we need to connect to.
 * @param {Function} fn Open listener.
 * @returns {WS}
 * @api public
 */
WS.connect = WS.createConnection = function connect(address, fn) {
  var client = new WS(address);

  if (typeof fn === 'function') {
    client.on('open', fn);
  }

  return client;
};

},{"./lib/Receiver":21,"./lib/Sender":23,"./lib/WebSocket":26,"./lib/WebSocketServer":27}],14:[function(require,module,exports){
(function (Buffer){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var util = require('util');

function BufferPool(initialSize, growStrategy, shrinkStrategy) {
  if (this instanceof BufferPool === false) {
    throw new TypeError("Classes can't be function-called");
  }

  if (typeof initialSize === 'function') {
    shrinkStrategy = growStrategy;
    growStrategy = initialSize;
    initialSize = 0;
  }
  else if (typeof initialSize === 'undefined') {
    initialSize = 0;
  }
  this._growStrategy = (growStrategy || function(db, size) {
    return db.used + size;
  }).bind(null, this);
  this._shrinkStrategy = (shrinkStrategy || function(db) {
    return initialSize;
  }).bind(null, this);
  this._buffer = initialSize ? new Buffer(initialSize) : null;
  this._offset = 0;
  this._used = 0;
  this._changeFactor = 0;
  this.__defineGetter__('size', function(){
    return this._buffer == null ? 0 : this._buffer.length;
  });
  this.__defineGetter__('used', function(){
    return this._used;
  });
}

BufferPool.prototype.get = function(length) {
  if (this._buffer == null || this._offset + length > this._buffer.length) {
    var newBuf = new Buffer(this._growStrategy(length));
    this._buffer = newBuf;
    this._offset = 0;
  }
  this._used += length;
  var buf = this._buffer.slice(this._offset, this._offset + length);
  this._offset += length;
  return buf;
}

BufferPool.prototype.reset = function(forceNewBuffer) {
  var len = this._shrinkStrategy();
  if (len < this.size) this._changeFactor -= 1;
  if (forceNewBuffer || this._changeFactor < -2) {
    this._changeFactor = 0;
    this._buffer = len ? new Buffer(len) : null;
  }
  this._offset = 0;
  this._used = 0;
}

module.exports = BufferPool;

}).call(this,require("buffer").Buffer)
},{"buffer":4,"util":undefined}],15:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

exports.BufferUtil = {
  merge: function(mergedBuffer, buffers) {
    var offset = 0;
    for (var i = 0, l = buffers.length; i < l; ++i) {
      var buf = buffers[i];
      buf.copy(mergedBuffer, offset);
      offset += buf.length;
    }
  },
  mask: function(source, mask, output, offset, length) {
    var maskNum = mask.readUInt32LE(0, true);
    var i = 0;
    for (; i < length - 3; i += 4) {
      var num = maskNum ^ source.readUInt32LE(i, true);
      if (num < 0) num = 4294967296 + num;
      output.writeUInt32LE(num, offset + i, true);
    }
    switch (length % 4) {
      case 3: output[offset + i + 2] = source[i + 2] ^ mask[2];
      case 2: output[offset + i + 1] = source[i + 1] ^ mask[1];
      case 1: output[offset + i] = source[i] ^ mask[0];
      case 0:;
    }
  },
  unmask: function(data, mask) {
    var maskNum = mask.readUInt32LE(0, true);
    var length = data.length;
    var i = 0;
    for (; i < length - 3; i += 4) {
      var num = maskNum ^ data.readUInt32LE(i, true);
      if (num < 0) num = 4294967296 + num;
      data.writeUInt32LE(num, i, true);
    }
    switch (length % 4) {
      case 3: data[i + 2] = data[i + 2] ^ mask[2];
      case 2: data[i + 1] = data[i + 1] ^ mask[1];
      case 1: data[i] = data[i] ^ mask[0];
      case 0:;
    }
  }
}

},{}],16:[function(require,module,exports){
'use strict';

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

try {
  module.exports = require('bufferutil');
} catch (e) {
  module.exports = require('./BufferUtil.fallback');
}

},{"./BufferUtil.fallback":15,"bufferutil":7}],17:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

module.exports = {
  isValidErrorCode: function(code) {
    return (code >= 1000 && code <= 1011 && code != 1004 && code != 1005 && code != 1006) ||
         (code >= 3000 && code <= 4999);
  },
  1000: 'normal',
  1001: 'going away',
  1002: 'protocol error',
  1003: 'unsupported data',
  1004: 'reserved',
  1005: 'reserved for extensions',
  1006: 'reserved for extensions',
  1007: 'inconsistent or invalid data',
  1008: 'policy violation',
  1009: 'message too big',
  1010: 'extension handshake missing',
  1011: 'an unexpected condition prevented the request from being fulfilled',
};
},{}],18:[function(require,module,exports){

var util = require('util');

/**
 * Module exports.
 */

exports.parse = parse;
exports.format = format;

/**
 * Parse extensions header value
 */

function parse(value) {
  value = value || '';

  var extensions = {};

  value.split(',').forEach(function(v) {
    var params = v.split(';');
    var token = params.shift().trim();
    var paramsList = extensions[token] = extensions[token] || [];
    var parsedParams = {};

    params.forEach(function(param) {
      var parts = param.trim().split('=');
      var key = parts[0];
      var value = parts[1];
      if (typeof value === 'undefined') {
        value = true;
      } else {
        // unquote value
        if (value[0] === '"') {
          value = value.slice(1);
        }
        if (value[value.length - 1] === '"') {
          value = value.slice(0, value.length - 1);
        }
      }
      (parsedParams[key] = parsedParams[key] || []).push(value);
    });

    paramsList.push(parsedParams);
  });

  return extensions;
}

/**
 * Format extensions header value
 */

function format(value) {
  return Object.keys(value).map(function(token) {
    var paramsList = value[token];
    if (!util.isArray(paramsList)) {
      paramsList = [paramsList];
    }
    return paramsList.map(function(params) {
      return [token].concat(Object.keys(params).map(function(k) {
        var p = params[k];
        if (!util.isArray(p)) p = [p];
        return p.map(function(v) {
          return v === true ? k : k + '=' + v;
        }).join('; ');
      })).join('; ');
    }).join(', ');
  }).join(', ');
}

},{"util":undefined}],19:[function(require,module,exports){
(function (Buffer){

var zlib = require('zlib');

var AVAILABLE_WINDOW_BITS = [8, 9, 10, 11, 12, 13, 14, 15];
var DEFAULT_WINDOW_BITS = 15;
var DEFAULT_MEM_LEVEL = 8;

PerMessageDeflate.extensionName = 'permessage-deflate';

/**
 * Per-message Compression Extensions implementation
 */

function PerMessageDeflate(options, isServer,maxPayload) {
  if (this instanceof PerMessageDeflate === false) {
    throw new TypeError("Classes can't be function-called");
  }

  this._options = options || {};
  this._isServer = !!isServer;
  this._inflate = null;
  this._deflate = null;
  this.params = null;
  this._maxPayload = maxPayload || 0;
}

/**
 * Create extension parameters offer
 *
 * @api public
 */

PerMessageDeflate.prototype.offer = function() {
  var params = {};
  if (this._options.serverNoContextTakeover) {
    params.server_no_context_takeover = true;
  }
  if (this._options.clientNoContextTakeover) {
    params.client_no_context_takeover = true;
  }
  if (this._options.serverMaxWindowBits) {
    params.server_max_window_bits = this._options.serverMaxWindowBits;
  }
  if (this._options.clientMaxWindowBits) {
    params.client_max_window_bits = this._options.clientMaxWindowBits;
  } else if (this._options.clientMaxWindowBits == null) {
    params.client_max_window_bits = true;
  }
  return params;
};

/**
 * Accept extension offer
 *
 * @api public
 */

PerMessageDeflate.prototype.accept = function(paramsList) {
  paramsList = this.normalizeParams(paramsList);

  var params;
  if (this._isServer) {
    params = this.acceptAsServer(paramsList);
  } else {
    params = this.acceptAsClient(paramsList);
  }

  this.params = params;
  return params;
};

/**
 * Releases all resources used by the extension
 *
 * @api public
 */

PerMessageDeflate.prototype.cleanup = function() {
  if (this._inflate) {
    if (this._inflate.writeInProgress) {
      this._inflate.pendingClose = true;
    } else {
      if (this._inflate.close) this._inflate.close();
      this._inflate = null;
    }
  }
  if (this._deflate) {
    if (this._deflate.writeInProgress) {
      this._deflate.pendingClose = true;
    } else {
      if (this._deflate.close) this._deflate.close();
      this._deflate = null;
    }
  }
};

/**
 * Accept extension offer from client
 *
 * @api private
 */

PerMessageDeflate.prototype.acceptAsServer = function(paramsList) {
  var accepted = {};
  var result = paramsList.some(function(params) {
    accepted = {};
    if (this._options.serverNoContextTakeover === false && params.server_no_context_takeover) {
      return;
    }
    if (this._options.serverMaxWindowBits === false && params.server_max_window_bits) {
      return;
    }
    if (typeof this._options.serverMaxWindowBits === 'number' &&
        typeof params.server_max_window_bits === 'number' &&
        this._options.serverMaxWindowBits > params.server_max_window_bits) {
      return;
    }
    if (typeof this._options.clientMaxWindowBits === 'number' && !params.client_max_window_bits) {
      return;
    }

    if (this._options.serverNoContextTakeover || params.server_no_context_takeover) {
      accepted.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover !== false && params.client_no_context_takeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof this._options.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = this._options.serverMaxWindowBits;
    } else if (typeof params.server_max_window_bits === 'number') {
      accepted.server_max_window_bits = params.server_max_window_bits;
    }
    if (typeof this._options.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits !== false && typeof params.client_max_window_bits === 'number') {
      accepted.client_max_window_bits = params.client_max_window_bits;
    }
    return true;
  }, this);

  if (!result) {
    throw new Error('Doesn\'t support the offered configuration');
  }

  return accepted;
};

/**
 * Accept extension response from server
 *
 * @api privaye
 */

PerMessageDeflate.prototype.acceptAsClient = function(paramsList) {
  var params = paramsList[0];
  if (this._options.clientNoContextTakeover != null) {
    if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
      throw new Error('Invalid value for "client_no_context_takeover"');
    }
  }
  if (this._options.clientMaxWindowBits != null) {
    if (this._options.clientMaxWindowBits === false && params.client_max_window_bits) {
      throw new Error('Invalid value for "client_max_window_bits"');
    }
    if (typeof this._options.clientMaxWindowBits === 'number' &&
        (!params.client_max_window_bits || params.client_max_window_bits > this._options.clientMaxWindowBits)) {
      throw new Error('Invalid value for "client_max_window_bits"');
    }
  }
  return params;
};

/**
 * Normalize extensions parameters
 *
 * @api private
 */

PerMessageDeflate.prototype.normalizeParams = function(paramsList) {
  return paramsList.map(function(params) {
    Object.keys(params).forEach(function(key) {
      var value = params[key];
      if (value.length > 1) {
        throw new Error('Multiple extension parameters for ' + key);
      }

      value = value[0];

      switch (key) {
      case 'server_no_context_takeover':
      case 'client_no_context_takeover':
        if (value !== true) {
          throw new Error('invalid extension parameter value for ' + key + ' (' + value + ')');
        }
        params[key] = true;
        break;
      case 'server_max_window_bits':
      case 'client_max_window_bits':
        if (typeof value === 'string') {
          value = parseInt(value, 10);
          if (!~AVAILABLE_WINDOW_BITS.indexOf(value)) {
            throw new Error('invalid extension parameter value for ' + key + ' (' + value + ')');
          }
        }
        if (!this._isServer && value === true) {
          throw new Error('Missing extension parameter value for ' + key);
        }
        params[key] = value;
        break;
      default:
        throw new Error('Not defined extension parameter (' + key + ')');
      }
    }, this);
    return params;
  }, this);
};

/**
 * Decompress message
 *
 * @api public
 */

PerMessageDeflate.prototype.decompress = function (data, fin, callback) {
  var endpoint = this._isServer ? 'client' : 'server';

  if (!this._inflate) {
    var maxWindowBits = this.params[endpoint + '_max_window_bits'];
    this._inflate = zlib.createInflateRaw({
      windowBits: 'number' === typeof maxWindowBits ? maxWindowBits : DEFAULT_WINDOW_BITS
    });
  }
  this._inflate.writeInProgress = true;

  var self = this;
  var buffers = [];
  var cumulativeBufferLength=0;

  this._inflate.on('error', onError).on('data', onData);
  this._inflate.write(data);
  if (fin) {
    this._inflate.write(new Buffer([0x00, 0x00, 0xff, 0xff]));
  }
  this._inflate.flush(function() {
    cleanup();
    callback(null, Buffer.concat(buffers));
  });

  function onError(err) {
    cleanup();
    callback(err);
  }

  function onData(data) {
      if(self._maxPayload!==undefined && self._maxPayload!==null && self._maxPayload>0){
          cumulativeBufferLength+=data.length;
          if(cumulativeBufferLength>self._maxPayload){
            buffers=[];
            cleanup();
            var err={type:1009};
            callback(err);
            return;
          }
      }
      buffers.push(data);
  }

  function cleanup() {
    if (!self._inflate) return;
    self._inflate.removeListener('error', onError);
    self._inflate.removeListener('data', onData);
    self._inflate.writeInProgress = false;
    if ((fin && self.params[endpoint + '_no_context_takeover']) || self._inflate.pendingClose) {
      if (self._inflate.close) self._inflate.close();
      self._inflate = null;
    }
  }
};

/**
 * Compress message
 *
 * @api public
 */

PerMessageDeflate.prototype.compress = function (data, fin, callback) {
  var endpoint = this._isServer ? 'server' : 'client';

  if (!this._deflate) {
    var maxWindowBits = this.params[endpoint + '_max_window_bits'];
    this._deflate = zlib.createDeflateRaw({
      flush: zlib.Z_SYNC_FLUSH,
      windowBits: 'number' === typeof maxWindowBits ? maxWindowBits : DEFAULT_WINDOW_BITS,
      memLevel: this._options.memLevel || DEFAULT_MEM_LEVEL
    });
  }
  this._deflate.writeInProgress = true;

  var self = this;
  var buffers = [];

  this._deflate.on('error', onError).on('data', onData);
  this._deflate.write(data);
  this._deflate.flush(function() {
    cleanup();
    var data = Buffer.concat(buffers);
    if (fin) {
      data = data.slice(0, data.length - 4);
    }
    callback(null, data);
  });

  function onError(err) {
    cleanup();
    callback(err);
  }

  function onData(data) {
    buffers.push(data);
  }

  function cleanup() {
    if (!self._deflate) return;
    self._deflate.removeListener('error', onError);
    self._deflate.removeListener('data', onData);
    self._deflate.writeInProgress = false;
    if ((fin && self.params[endpoint + '_no_context_takeover']) || self._deflate.pendingClose) {
      if (self._deflate.close) self._deflate.close();
      self._deflate = null;
    }
  }
};

module.exports = PerMessageDeflate;

}).call(this,require("buffer").Buffer)
},{"buffer":4,"zlib":undefined}],20:[function(require,module,exports){
(function (Buffer){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var util = require('util');

/**
 * State constants
 */

var EMPTY = 0
  , BODY = 1;
var BINARYLENGTH = 2
  , BINARYBODY = 3;

/**
 * Hixie Receiver implementation
 */

function Receiver () {
  if (this instanceof Receiver === false) {
    throw new TypeError("Classes can't be function-called");
  }

  this.state = EMPTY;
  this.buffers = [];
  this.messageEnd = -1;
  this.spanLength = 0;
  this.dead = false;

  this.onerror = function() {};
  this.ontext = function() {};
  this.onbinary = function() {};
  this.onclose = function() {};
  this.onping = function() {};
  this.onpong = function() {};
}

module.exports = Receiver;

/**
 * Add new data to the parser.
 *
 * @api public
 */

Receiver.prototype.add = function(data) {
  if (this.dead) return;
  var self = this;
  function doAdd() {
    if (self.state === EMPTY) {
      if (data.length == 2 && data[0] == 0xFF && data[1] == 0x00) {
        self.reset();
        self.onclose();
        return;
      }
      if (data[0] === 0x80) {
        self.messageEnd = 0;
        self.state = BINARYLENGTH;
        data = data.slice(1);
      } else {

      if (data[0] !== 0x00) {
        self.error('payload must start with 0x00 byte', true);
        return;
      }
      data = data.slice(1);
      self.state = BODY;

      }
    }
    if (self.state === BINARYLENGTH) {
      var i = 0;
      while ((i < data.length) && (data[i] & 0x80)) {
        self.messageEnd = 128 * self.messageEnd + (data[i] & 0x7f);
        ++i;
      }
      if (i < data.length) {
        self.messageEnd = 128 * self.messageEnd + (data[i] & 0x7f);
        self.state = BINARYBODY;
        ++i;
      }
      if (i > 0)
        data = data.slice(i);
    }
    if (self.state === BINARYBODY) {
      var dataleft = self.messageEnd - self.spanLength;
      if (data.length >= dataleft) {
        // consume the whole buffer to finish the frame
        self.buffers.push(data);
        self.spanLength += dataleft;
        self.messageEnd = dataleft;
        return self.parse();
      }
      // frame's not done even if we consume it all
      self.buffers.push(data);
      self.spanLength += data.length;
      return;
    }
    self.buffers.push(data);
    if ((self.messageEnd = bufferIndex(data, 0xFF)) != -1) {
      self.spanLength += self.messageEnd;
      return self.parse();
    }
    else self.spanLength += data.length;
  }
  while(data) data = doAdd();
};

/**
 * Releases all resources used by the receiver.
 *
 * @api public
 */

Receiver.prototype.cleanup = function() {
  this.dead = true;
  this.state = EMPTY;
  this.buffers = [];
};

/**
 * Process buffered data.
 *
 * @api public
 */

Receiver.prototype.parse = function() {
  var output = new Buffer(this.spanLength);
  var outputIndex = 0;
  for (var bi = 0, bl = this.buffers.length; bi < bl - 1; ++bi) {
    var buffer = this.buffers[bi];
    buffer.copy(output, outputIndex);
    outputIndex += buffer.length;
  }
  var lastBuffer = this.buffers[this.buffers.length - 1];
  if (this.messageEnd > 0) lastBuffer.copy(output, outputIndex, 0, this.messageEnd);
  if (this.state !== BODY) --this.messageEnd;
  var tail = null;
  if (this.messageEnd < lastBuffer.length - 1) {
    tail = lastBuffer.slice(this.messageEnd + 1);
  }
  this.reset();
  this.ontext(output.toString('utf8'));
  return tail;
};

/**
 * Handles an error
 *
 * @api private
 */

Receiver.prototype.error = function (reason, terminate) {
  if (this.dead) return;
  this.reset();
  if(typeof reason == 'string'){
    this.onerror(new Error(reason), terminate);
  }
  else if(reason.constructor == Error){
    this.onerror(reason, terminate);
  }
  else{
    this.onerror(new Error("An error occured"),terminate);
  }
  return this;
};

/**
 * Reset parser state
 *
 * @api private
 */

Receiver.prototype.reset = function (reason) {
  if (this.dead) return;
  this.state = EMPTY;
  this.buffers = [];
  this.messageEnd = -1;
  this.spanLength = 0;
};

/**
 * Internal api
 */

function bufferIndex(buffer, byte) {
  for (var i = 0, l = buffer.length; i < l; ++i) {
    if (buffer[i] === byte) return i;
  }
  return -1;
}

}).call(this,require("buffer").Buffer)
},{"buffer":4,"util":undefined}],21:[function(require,module,exports){
(function (Buffer){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var util = require('util')
  , Validation = require('./Validation').Validation
  , ErrorCodes = require('./ErrorCodes')
  , BufferPool = require('./BufferPool')
  , bufferUtil = require('./BufferUtil').BufferUtil
  , PerMessageDeflate = require('./PerMessageDeflate');

/**
 * HyBi Receiver implementation
 */

function Receiver (extensions,maxPayload) {
  if (this instanceof Receiver === false) {
    throw new TypeError("Classes can't be function-called");
  }
  if(typeof extensions==='number'){
    maxPayload=extensions;
    extensions={};
  }


  // memory pool for fragmented messages
  var fragmentedPoolPrevUsed = -1;
  this.fragmentedBufferPool = new BufferPool(1024, function(db, length) {
    return db.used + length;
  }, function(db) {
    return fragmentedPoolPrevUsed = fragmentedPoolPrevUsed >= 0 ?
      Math.ceil((fragmentedPoolPrevUsed + db.used) / 2) :
      db.used;
  });

  // memory pool for unfragmented messages
  var unfragmentedPoolPrevUsed = -1;
  this.unfragmentedBufferPool = new BufferPool(1024, function(db, length) {
    return db.used + length;
  }, function(db) {
    return unfragmentedPoolPrevUsed = unfragmentedPoolPrevUsed >= 0 ?
      Math.ceil((unfragmentedPoolPrevUsed + db.used) / 2) :
      db.used;
  });
  this.extensions = extensions || {};
  this.maxPayload = maxPayload || 0;
  this.currentPayloadLength = 0;
  this.state = {
    activeFragmentedOperation: null,
    lastFragment: false,
    masked: false,
    opcode: 0,
    fragmentedOperation: false
  };
  this.overflow = [];
  this.headerBuffer = new Buffer(10);
  this.expectOffset = 0;
  this.expectBuffer = null;
  this.expectHandler = null;
  this.currentMessage = [];
  this.currentMessageLength = 0;
  this.messageHandlers = [];
  this.expectHeader(2, this.processPacket);
  this.dead = false;
  this.processing = false;

  this.onerror = function() {};
  this.ontext = function() {};
  this.onbinary = function() {};
  this.onclose = function() {};
  this.onping = function() {};
  this.onpong = function() {};
}

module.exports = Receiver;

/**
 * Add new data to the parser.
 *
 * @api public
 */

Receiver.prototype.add = function(data) {
  if (this.dead) return;
  var dataLength = data.length;
  if (dataLength == 0) return;
  if (this.expectBuffer == null) {
    this.overflow.push(data);
    return;
  }
  var toRead = Math.min(dataLength, this.expectBuffer.length - this.expectOffset);
  fastCopy(toRead, data, this.expectBuffer, this.expectOffset);
  this.expectOffset += toRead;
  if (toRead < dataLength) {
    this.overflow.push(data.slice(toRead));
  }
  while (this.expectBuffer && this.expectOffset == this.expectBuffer.length) {
    var bufferForHandler = this.expectBuffer;
    this.expectBuffer = null;
    this.expectOffset = 0;
    this.expectHandler.call(this, bufferForHandler);
  }
};

/**
 * Releases all resources used by the receiver.
 *
 * @api public
 */

Receiver.prototype.cleanup = function() {
  this.dead = true;
  this.overflow = null;
  this.headerBuffer = null;
  this.expectBuffer = null;
  this.expectHandler = null;
  this.unfragmentedBufferPool = null;
  this.fragmentedBufferPool = null;
  this.state = null;
  this.currentMessage = null;
  this.onerror = null;
  this.ontext = null;
  this.onbinary = null;
  this.onclose = null;
  this.onping = null;
  this.onpong = null;
};

/**
 * Waits for a certain amount of header bytes to be available, then fires a callback.
 *
 * @api private
 */

Receiver.prototype.expectHeader = function(length, handler) {
  if (length == 0) {
    handler(null);
    return;
  }
  this.expectBuffer = this.headerBuffer.slice(this.expectOffset, this.expectOffset + length);
  this.expectHandler = handler;
  var toRead = length;
  while (toRead > 0 && this.overflow.length > 0) {
    var fromOverflow = this.overflow.pop();
    if (toRead < fromOverflow.length) this.overflow.push(fromOverflow.slice(toRead));
    var read = Math.min(fromOverflow.length, toRead);
    fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset);
    this.expectOffset += read;
    toRead -= read;
  }
};

/**
 * Waits for a certain amount of data bytes to be available, then fires a callback.
 *
 * @api private
 */

Receiver.prototype.expectData = function(length, handler) {
  if (length == 0) {
    handler(null);
    return;
  }
  this.expectBuffer = this.allocateFromPool(length, this.state.fragmentedOperation);
  this.expectHandler = handler;
  var toRead = length;
  while (toRead > 0 && this.overflow.length > 0) {
    var fromOverflow = this.overflow.pop();
    if (toRead < fromOverflow.length) this.overflow.push(fromOverflow.slice(toRead));
    var read = Math.min(fromOverflow.length, toRead);
    fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset);
    this.expectOffset += read;
    toRead -= read;
  }
};

/**
 * Allocates memory from the buffer pool.
 *
 * @api private
 */

Receiver.prototype.allocateFromPool = function(length, isFragmented) {
  return (isFragmented ? this.fragmentedBufferPool : this.unfragmentedBufferPool).get(length);
};

/**
 * Start processing a new packet.
 *
 * @api private
 */

Receiver.prototype.processPacket = function (data) {
  if (this.extensions[PerMessageDeflate.extensionName]) {
    if ((data[0] & 0x30) != 0) {
      this.error('reserved fields (2, 3) must be empty', 1002);
      return;
    }
  } else {
    if ((data[0] & 0x70) != 0) {
      this.error('reserved fields must be empty', 1002);
      return;
    }
  }
  this.state.lastFragment = (data[0] & 0x80) == 0x80;
  this.state.masked = (data[1] & 0x80) == 0x80;
  var compressed = (data[0] & 0x40) == 0x40;
  var opcode = data[0] & 0xf;
  if (opcode === 0) {
    if (compressed) {
      this.error('continuation frame cannot have the Per-message Compressed bits', 1002);
      return;
    }
    // continuation frame
    this.state.fragmentedOperation = true;
    this.state.opcode = this.state.activeFragmentedOperation;
    if (!(this.state.opcode == 1 || this.state.opcode == 2)) {
      this.error('continuation frame cannot follow current opcode', 1002);
      return;
    }
  }
  else {
    if (opcode < 3 && this.state.activeFragmentedOperation != null) {
      this.error('data frames after the initial data frame must have opcode 0', 1002);
      return;
    }
    if (opcode >= 8 && compressed) {
      this.error('control frames cannot have the Per-message Compressed bits', 1002);
      return;
    }
    this.state.compressed = compressed;
    this.state.opcode = opcode;
    if (this.state.lastFragment === false) {
      this.state.fragmentedOperation = true;
      this.state.activeFragmentedOperation = opcode;
    }
    else this.state.fragmentedOperation = false;
  }
  var handler = opcodes[this.state.opcode];
  if (typeof handler == 'undefined') this.error('no handler for opcode ' + this.state.opcode, 1002);
  else {
    handler.start.call(this, data);
  }
};

/**
 * Endprocessing a packet.
 *
 * @api private
 */

Receiver.prototype.endPacket = function() {
  if (this.dead) return;
  if (!this.state.fragmentedOperation) this.unfragmentedBufferPool.reset(true);
  else if (this.state.lastFragment) this.fragmentedBufferPool.reset(true);
  this.expectOffset = 0;
  this.expectBuffer = null;
  this.expectHandler = null;
  if (this.state.lastFragment && this.state.opcode === this.state.activeFragmentedOperation) {
    // end current fragmented operation
    this.state.activeFragmentedOperation = null;
  }
  this.currentPayloadLength = 0;
  this.state.lastFragment = false;
  this.state.opcode = this.state.activeFragmentedOperation != null ? this.state.activeFragmentedOperation : 0;
  this.state.masked = false;
  this.expectHeader(2, this.processPacket);
};

/**
 * Reset the parser state.
 *
 * @api private
 */

Receiver.prototype.reset = function() {
  if (this.dead) return;
  this.state = {
    activeFragmentedOperation: null,
    lastFragment: false,
    masked: false,
    opcode: 0,
    fragmentedOperation: false
  };
  this.fragmentedBufferPool.reset(true);
  this.unfragmentedBufferPool.reset(true);
  this.expectOffset = 0;
  this.expectBuffer = null;
  this.expectHandler = null;
  this.overflow = [];
  this.currentMessage = [];
  this.currentMessageLength = 0;
  this.messageHandlers = [];
  this.currentPayloadLength = 0;
};

/**
 * Unmask received data.
 *
 * @api private
 */

Receiver.prototype.unmask = function (mask, buf, binary) {
  if (mask != null && buf != null) bufferUtil.unmask(buf, mask);
  if (binary) return buf;
  return buf != null ? buf.toString('utf8') : '';
};

/**
 * Handles an error
 *
 * @api private
 */

Receiver.prototype.error = function (reason, protocolErrorCode) {
  if (this.dead) return;
  this.reset();
  if(typeof reason == 'string'){
    this.onerror(new Error(reason), protocolErrorCode);
  }
  else if(reason.constructor == Error){
    this.onerror(reason, protocolErrorCode);
  }
  else{
    this.onerror(new Error("An error occured"),protocolErrorCode);
  }
  return this;
};

/**
 * Execute message handler buffers
 *
 * @api private
 */

Receiver.prototype.flush = function() {
  if (this.processing || this.dead) return;

  var handler = this.messageHandlers.shift();
  if (!handler) return;

  this.processing = true;
  var self = this;

  handler(function() {
    self.processing = false;
    self.flush();
  });
};

/**
 * Apply extensions to message
 *
 * @api private
 */

Receiver.prototype.applyExtensions = function(messageBuffer, fin, compressed, callback) {
  var self = this;
  if (compressed) {
    this.extensions[PerMessageDeflate.extensionName].decompress(messageBuffer, fin, function(err, buffer) {
      if (self.dead) return;
      if (err) {
        callback(new Error('invalid compressed data'));
        return;
      }
      callback(null, buffer);
    });
  } else {
    callback(null, messageBuffer);
  }
};

/**
* Checks payload size, disconnects socket when it exceeds maxPayload
*
* @api private
*/
Receiver.prototype.maxPayloadExceeded = function(length) {
  if (this.maxPayload=== undefined || this.maxPayload === null || this.maxPayload < 1) {
    return false;
  }
  var fullLength = this.currentPayloadLength + length;
  if (fullLength < this.maxPayload) {
    this.currentPayloadLength = fullLength;
    return false;
  }
  this.error('payload cannot exceed ' + this.maxPayload + ' bytes', 1009);
  this.messageBuffer=[];
  this.cleanup();

  return true;
};

/**
 * Buffer utilities
 */

function readUInt16BE(start) {
  return (this[start]<<8) +
         this[start+1];
}

function readUInt32BE(start) {
  return (this[start]<<24) +
         (this[start+1]<<16) +
         (this[start+2]<<8) +
         this[start+3];
}

function fastCopy(length, srcBuffer, dstBuffer, dstOffset) {
  switch (length) {
    default: srcBuffer.copy(dstBuffer, dstOffset, 0, length); break;
    case 16: dstBuffer[dstOffset+15] = srcBuffer[15];
    case 15: dstBuffer[dstOffset+14] = srcBuffer[14];
    case 14: dstBuffer[dstOffset+13] = srcBuffer[13];
    case 13: dstBuffer[dstOffset+12] = srcBuffer[12];
    case 12: dstBuffer[dstOffset+11] = srcBuffer[11];
    case 11: dstBuffer[dstOffset+10] = srcBuffer[10];
    case 10: dstBuffer[dstOffset+9] = srcBuffer[9];
    case 9: dstBuffer[dstOffset+8] = srcBuffer[8];
    case 8: dstBuffer[dstOffset+7] = srcBuffer[7];
    case 7: dstBuffer[dstOffset+6] = srcBuffer[6];
    case 6: dstBuffer[dstOffset+5] = srcBuffer[5];
    case 5: dstBuffer[dstOffset+4] = srcBuffer[4];
    case 4: dstBuffer[dstOffset+3] = srcBuffer[3];
    case 3: dstBuffer[dstOffset+2] = srcBuffer[2];
    case 2: dstBuffer[dstOffset+1] = srcBuffer[1];
    case 1: dstBuffer[dstOffset] = srcBuffer[0];
  }
}

function clone(obj) {
  var cloned = {};
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      cloned[k] = obj[k];
    }
  }
  return cloned;
}

/**
 * Opcode handlers
 */

var opcodes = {
  // text
  '1': {
    start: function(data) {
      var self = this;
      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
        if (self.maxPayloadExceeded(firstLength)){
          self.error('Maximumpayload exceeded in compressed text message. Aborting...', 1009);
          return;
        }
        opcodes['1'].getData.call(self, firstLength);
      }
      else if (firstLength == 126) {
        self.expectHeader(2, function(data) {
          var length = readUInt16BE.call(data, 0);
          if (self.maxPayloadExceeded(length)){
            self.error('Maximumpayload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
          opcodes['1'].getData.call(self, length);
        });
      }
      else if (firstLength == 127) {
        self.expectHeader(8, function(data) {
          if (readUInt32BE.call(data, 0) != 0) {
            self.error('packets with length spanning more than 32 bit is currently not supported', 1008);
            return;
          }
          var length = readUInt32BE.call(data, 4);
          if (self.maxPayloadExceeded(length)){
            self.error('Maximumpayload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
          opcodes['1'].getData.call(self, readUInt32BE.call(data, 4));
        });
      }
    },
    getData: function(length) {
      var self = this;
      if (self.state.masked) {
        self.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['1'].finish.call(self, mask, data);
          });
        });
      }
      else {
        self.expectData(length, function(data) {
          opcodes['1'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      var packet = this.unmask(mask, data, true) || new Buffer(0);
      var state = clone(this.state);
      this.messageHandlers.push(function(callback) {
        self.applyExtensions(packet, state.lastFragment, state.compressed, function(err, buffer) {
          if (err) {
            if(err.type===1009){
                return self.error('Maximumpayload exceeded in compressed text message. Aborting...', 1009);
            }
            return self.error(err.message, 1007);
          }
          if (buffer != null) {
            if( self.maxPayload==0 || (self.maxPayload > 0 && (self.currentMessageLength + buffer.length) < self.maxPayload) ){
              self.currentMessage.push(buffer);
            }
            else{
                self.currentMessage=null;
                self.currentMessage = [];
                self.currentMessageLength = 0;
                self.error(new Error('Maximum payload exceeded. maxPayload: '+self.maxPayload), 1009);
                return;
            }
            self.currentMessageLength += buffer.length;
          }
          if (state.lastFragment) {
            var messageBuffer = Buffer.concat(self.currentMessage);
            self.currentMessage = [];
            self.currentMessageLength = 0;
            if (!Validation.isValidUTF8(messageBuffer)) {
              self.error('invalid utf8 sequence', 1007);
              return;
            }
            self.ontext(messageBuffer.toString('utf8'), {masked: state.masked, buffer: messageBuffer});
          }
          callback();
        });
      });
      this.flush();
      this.endPacket();
    }
  },
  // binary
  '2': {
    start: function(data) {
      var self = this;
      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
          if (self.maxPayloadExceeded(firstLength)){
            self.error('Max payload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
        opcodes['2'].getData.call(self, firstLength);
      }
      else if (firstLength == 126) {
        self.expectHeader(2, function(data) {
          var length = readUInt16BE.call(data, 0);
          if (self.maxPayloadExceeded(length)){
            self.error('Max payload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
          opcodes['2'].getData.call(self, length);
        });
      }
      else if (firstLength == 127) {
        self.expectHeader(8, function(data) {
          if (readUInt32BE.call(data, 0) != 0) {
            self.error('packets with length spanning more than 32 bit is currently not supported', 1008);
            return;
          }
          var length = readUInt32BE.call(data, 4, true);
          if (self.maxPayloadExceeded(length)){
            self.error('Max payload exceeded in compressed text message. Aborting...', 1009);
            return;
          }
          opcodes['2'].getData.call(self, length);
        });
      }
    },
    getData: function(length) {
      var self = this;
      if (self.state.masked) {
        self.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['2'].finish.call(self, mask, data);
          });
        });
      }
      else {
        self.expectData(length, function(data) {
          opcodes['2'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      var packet = this.unmask(mask, data, true) || new Buffer(0);
      var state = clone(this.state);
      this.messageHandlers.push(function(callback) {
        self.applyExtensions(packet, state.lastFragment, state.compressed, function(err, buffer) {
          if (err) {
            if(err.type===1009){
                return self.error('Max payload exceeded in compressed binary message. Aborting...', 1009);
            }
            return self.error(err.message, 1007);
          }
          if (buffer != null) {
            if( self.maxPayload==0 || (self.maxPayload > 0 && (self.currentMessageLength + buffer.length) < self.maxPayload) ){
              self.currentMessage.push(buffer);
            }
            else{
                self.currentMessage=null;
                self.currentMessage = [];
                self.currentMessageLength = 0;
                self.error(new Error('Maximum payload exceeded'), 1009);
                return;
            }
            self.currentMessageLength += buffer.length;
          }
          if (state.lastFragment) {
            var messageBuffer = Buffer.concat(self.currentMessage);
            self.currentMessage = [];
            self.currentMessageLength = 0;
            self.onbinary(messageBuffer, {masked: state.masked, buffer: messageBuffer});
          }
          callback();
        });
      });
      this.flush();
      this.endPacket();
    }
  },
  // close
  '8': {
    start: function(data) {
      var self = this;
      if (self.state.lastFragment == false) {
        self.error('fragmented close is not supported', 1002);
        return;
      }

      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
        opcodes['8'].getData.call(self, firstLength);
      }
      else {
        self.error('control frames cannot have more than 125 bytes of data', 1002);
      }
    },
    getData: function(length) {
      var self = this;
      if (self.state.masked) {
        self.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['8'].finish.call(self, mask, data);
          });
        });
      }
      else {
        self.expectData(length, function(data) {
          opcodes['8'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      data = self.unmask(mask, data, true);

      var state = clone(this.state);
      this.messageHandlers.push(function() {
        if (data && data.length == 1) {
          self.error('close packets with data must be at least two bytes long', 1002);
          return;
        }
        var code = data && data.length > 1 ? readUInt16BE.call(data, 0) : 1000;
        if (!ErrorCodes.isValidErrorCode(code)) {
          self.error('invalid error code', 1002);
          return;
        }
        var message = '';
        if (data && data.length > 2) {
          var messageBuffer = data.slice(2);
          if (!Validation.isValidUTF8(messageBuffer)) {
            self.error('invalid utf8 sequence', 1007);
            return;
          }
          message = messageBuffer.toString('utf8');
        }
        self.onclose(code, message, {masked: state.masked});
        self.reset();
      });
      this.flush();
    },
  },
  // ping
  '9': {
    start: function(data) {
      var self = this;
      if (self.state.lastFragment == false) {
        self.error('fragmented ping is not supported', 1002);
        return;
      }

      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
        opcodes['9'].getData.call(self, firstLength);
      }
      else {
        self.error('control frames cannot have more than 125 bytes of data', 1002);
      }
    },
    getData: function(length) {
      var self = this;
      if (self.state.masked) {
        self.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['9'].finish.call(self, mask, data);
          });
        });
      }
      else {
        self.expectData(length, function(data) {
          opcodes['9'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      data = this.unmask(mask, data, true);
      var state = clone(this.state);
      this.messageHandlers.push(function(callback) {
        self.onping(data, {masked: state.masked, binary: true});
        callback();
      });
      this.flush();
      this.endPacket();
    }
  },
  // pong
  '10': {
    start: function(data) {
      var self = this;
      if (self.state.lastFragment == false) {
        self.error('fragmented pong is not supported', 1002);
        return;
      }

      // decode length
      var firstLength = data[1] & 0x7f;
      if (firstLength < 126) {
        opcodes['10'].getData.call(self, firstLength);
      }
      else {
        self.error('control frames cannot have more than 125 bytes of data', 1002);
      }
    },
    getData: function(length) {
      var self = this;
      if (this.state.masked) {
        this.expectHeader(4, function(data) {
          var mask = data;
          self.expectData(length, function(data) {
            opcodes['10'].finish.call(self, mask, data);
          });
        });
      }
      else {
        this.expectData(length, function(data) {
          opcodes['10'].finish.call(self, null, data);
        });
      }
    },
    finish: function(mask, data) {
      var self = this;
      data = self.unmask(mask, data, true);
      var state = clone(this.state);
      this.messageHandlers.push(function(callback) {
        self.onpong(data, {masked: state.masked, binary: true});
        callback();
      });
      this.flush();
      this.endPacket();
    }
  }
}

}).call(this,require("buffer").Buffer)
},{"./BufferPool":14,"./BufferUtil":16,"./ErrorCodes":17,"./PerMessageDeflate":19,"./Validation":25,"buffer":4,"util":undefined}],22:[function(require,module,exports){
(function (Buffer){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var events = require('events')
  , util = require('util')
  , EventEmitter = events.EventEmitter;

/**
 * Hixie Sender implementation
 */

function Sender(socket) {
  if (this instanceof Sender === false) {
    throw new TypeError("Classes can't be function-called");
  }

  events.EventEmitter.call(this);

  this.socket = socket;
  this.continuationFrame = false;
  this.isClosed = false;
}

module.exports = Sender;

/**
 * Inherits from EventEmitter.
 */

util.inherits(Sender, events.EventEmitter);

/**
 * Frames and writes data.
 *
 * @api public
 */

Sender.prototype.send = function(data, options, cb) {
  if (this.isClosed) return;

  var isString = typeof data == 'string'
    , length = isString ? Buffer.byteLength(data) : data.length
    , lengthbytes = (length > 127) ? 2 : 1 // assume less than 2**14 bytes
    , writeStartMarker = this.continuationFrame == false
    , writeEndMarker = !options || !(typeof options.fin != 'undefined' && !options.fin)
    , buffer = new Buffer((writeStartMarker ? ((options && options.binary) ? (1 + lengthbytes) : 1) : 0) + length + ((writeEndMarker && !(options && options.binary)) ? 1 : 0))
    , offset = writeStartMarker ? 1 : 0;

  if (writeStartMarker) {
    if (options && options.binary) {
      buffer.write('\x80', 'binary');
      // assume length less than 2**14 bytes
      if (lengthbytes > 1)
        buffer.write(String.fromCharCode(128+length/128), offset++, 'binary');
      buffer.write(String.fromCharCode(length&0x7f), offset++, 'binary');
    } else
      buffer.write('\x00', 'binary');
  }

  if (isString) buffer.write(data, offset, 'utf8');
  else data.copy(buffer, offset, 0);

  if (writeEndMarker) {
    if (options && options.binary) {
      // sending binary, not writing end marker
    } else
      buffer.write('\xff', offset + length, 'binary');
    this.continuationFrame = false;
  }
  else this.continuationFrame = true;

  try {
    this.socket.write(buffer, 'binary', cb);
  } catch (e) {
    this.error(e.toString());
  }
};

/**
 * Sends a close instruction to the remote party.
 *
 * @api public
 */

Sender.prototype.close = function(code, data, mask, cb) {
  if (this.isClosed) return;
  this.isClosed = true;
  try {
    if (this.continuationFrame) this.socket.write(new Buffer([0xff], 'binary'));
    this.socket.write(new Buffer([0xff, 0x00]), 'binary', cb);
  } catch (e) {
    this.error(e.toString());
  }
};

/**
 * Sends a ping message to the remote party. Not available for hixie.
 *
 * @api public
 */

Sender.prototype.ping = function(data, options) {};

/**
 * Sends a pong message to the remote party. Not available for hixie.
 *
 * @api public
 */

Sender.prototype.pong = function(data, options) {};

/**
 * Handles an error
 *
 * @api private
 */

Sender.prototype.error = function (reason) {
  this.emit('error', reason);
  return this;
};

}).call(this,require("buffer").Buffer)
},{"buffer":4,"events":undefined,"util":undefined}],23:[function(require,module,exports){
(function (Buffer){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var events = require('events')
  , util = require('util')
  , EventEmitter = events.EventEmitter
  , ErrorCodes = require('./ErrorCodes')
  , bufferUtil = require('./BufferUtil').BufferUtil
  , PerMessageDeflate = require('./PerMessageDeflate');

/**
 * HyBi Sender implementation
 */

function Sender(socket, extensions) {
  if (this instanceof Sender === false) {
    throw new TypeError("Classes can't be function-called");
  }

  events.EventEmitter.call(this);

  this._socket = socket;
  this.extensions = extensions || {};
  this.firstFragment = true;
  this.compress = false;
  this.messageHandlers = [];
  this.processing = false;
}

/**
 * Inherits from EventEmitter.
 */

util.inherits(Sender, events.EventEmitter);

/**
 * Sends a close instruction to the remote party.
 *
 * @api public
 */

Sender.prototype.close = function(code, data, mask, cb) {
  if (typeof code !== 'undefined') {
    if (typeof code !== 'number' ||
      !ErrorCodes.isValidErrorCode(code)) throw new Error('first argument must be a valid error code number');
  }
  code = code || 1000;
  var dataBuffer = new Buffer(2 + (data ? Buffer.byteLength(data) : 0));
  writeUInt16BE.call(dataBuffer, code, 0);
  if (dataBuffer.length > 2) dataBuffer.write(data, 2);

  var self = this;
  this.messageHandlers.push(function(callback) {
    self.frameAndSend(0x8, dataBuffer, true, mask);
    callback();
    if (typeof cb == 'function') cb();
  });
  this.flush();
};

/**
 * Sends a ping message to the remote party.
 *
 * @api public
 */

Sender.prototype.ping = function(data, options) {
  var mask = options && options.mask;
  var self = this;
  this.messageHandlers.push(function(callback) {
    self.frameAndSend(0x9, data || '', true, mask);
    callback();
  });
  this.flush();
};

/**
 * Sends a pong message to the remote party.
 *
 * @api public
 */

Sender.prototype.pong = function(data, options) {
  var mask = options && options.mask;
  var self = this;
  this.messageHandlers.push(function(callback) {
    self.frameAndSend(0xa, data || '', true, mask);
    callback();
  });
  this.flush();
};

/**
 * Sends text or binary data to the remote party.
 *
 * @api public
 */

Sender.prototype.send = function(data, options, cb) {
  var finalFragment = options && options.fin === false ? false : true;
  var mask = options && options.mask;
  var compress = options && options.compress;
  var opcode = options && options.binary ? 2 : 1;
  if (this.firstFragment === false) {
    opcode = 0;
    compress = false;
  } else {
    this.firstFragment = false;
    this.compress = compress;
  }
  if (finalFragment) this.firstFragment = true

  var compressFragment = this.compress;

  var self = this;
  this.messageHandlers.push(function(callback) {
    self.applyExtensions(data, finalFragment, compressFragment, function(err, data) {
      if (err) {
        if (typeof cb == 'function') cb(err);
        else self.emit('error', err);
        return;
      }
      self.frameAndSend(opcode, data, finalFragment, mask, compress, cb);
      callback();
    });
  });
  this.flush();
};

/**
 * Frames and sends a piece of data according to the HyBi WebSocket protocol.
 *
 * @api private
 */

Sender.prototype.frameAndSend = function(opcode, data, finalFragment, maskData, compressed, cb) {
  var canModifyData = false;

  if (!data) {
    try {
      this._socket.write(new Buffer([opcode | (finalFragment ? 0x80 : 0), 0 | (maskData ? 0x80 : 0)].concat(maskData ? [0, 0, 0, 0] : [])), 'binary', cb);
    }
    catch (e) {
      if (typeof cb == 'function') cb(e);
      else this.emit('error', e);
    }
    return;
  }

  if (!Buffer.isBuffer(data)) {
    canModifyData = true;
    if (data && (typeof data.byteLength !== 'undefined' || typeof data.buffer !== 'undefined')) {
      data = getArrayBuffer(data);
    } else {
      //
      // If people want to send a number, this would allocate the number in
      // bytes as memory size instead of storing the number as buffer value. So
      // we need to transform it to string in order to prevent possible
      // vulnerabilities / memory attacks.
      //
      if (typeof data === 'number') data = data.toString();

      data = new Buffer(data);
    }
  }

  var dataLength = data.length
    , dataOffset = maskData ? 6 : 2
    , secondByte = dataLength;

  if (dataLength >= 65536) {
    dataOffset += 8;
    secondByte = 127;
  }
  else if (dataLength > 125) {
    dataOffset += 2;
    secondByte = 126;
  }

  var mergeBuffers = dataLength < 32768 || (maskData && !canModifyData);
  var totalLength = mergeBuffers ? dataLength + dataOffset : dataOffset;
  var outputBuffer = new Buffer(totalLength);
  outputBuffer[0] = finalFragment ? opcode | 0x80 : opcode;
  if (compressed) outputBuffer[0] |= 0x40;

  switch (secondByte) {
    case 126:
      writeUInt16BE.call(outputBuffer, dataLength, 2);
      break;
    case 127:
      writeUInt32BE.call(outputBuffer, 0, 2);
      writeUInt32BE.call(outputBuffer, dataLength, 6);
  }

  if (maskData) {
    outputBuffer[1] = secondByte | 0x80;
    var mask = getRandomMask();
    outputBuffer[dataOffset - 4] = mask[0];
    outputBuffer[dataOffset - 3] = mask[1];
    outputBuffer[dataOffset - 2] = mask[2];
    outputBuffer[dataOffset - 1] = mask[3];
    if (mergeBuffers) {
      bufferUtil.mask(data, mask, outputBuffer, dataOffset, dataLength);
      try {
        this._socket.write(outputBuffer, 'binary', cb);
      }
      catch (e) {
        if (typeof cb == 'function') cb(e);
        else this.emit('error', e);
      }
    }
    else {
      bufferUtil.mask(data, mask, data, 0, dataLength);
      try {
        this._socket.write(outputBuffer, 'binary');
        this._socket.write(data, 'binary', cb);
      }
      catch (e) {
        if (typeof cb == 'function') cb(e);
        else this.emit('error', e);
      }
    }
  }
  else {
    outputBuffer[1] = secondByte;
    if (mergeBuffers) {
      data.copy(outputBuffer, dataOffset);
      try {
        this._socket.write(outputBuffer, 'binary', cb);
      }
      catch (e) {
        if (typeof cb == 'function') cb(e);
        else this.emit('error', e);
      }
    }
    else {
      try {
        this._socket.write(outputBuffer, 'binary');
        this._socket.write(data, 'binary', cb);
      }
      catch (e) {
        if (typeof cb == 'function') cb(e);
        else this.emit('error', e);
      }
    }
  }
};

/**
 * Execute message handler buffers
 *
 * @api private
 */

Sender.prototype.flush = function() {
  if (this.processing) return;

  var handler = this.messageHandlers.shift();
  if (!handler) return;

  this.processing = true;

  var self = this;

  handler(function() {
    self.processing = false;
    self.flush();
  });
};

/**
 * Apply extensions to message
 *
 * @api private
 */

Sender.prototype.applyExtensions = function(data, fin, compress, callback) {
  if (compress && data) {
    if ((data.buffer || data) instanceof ArrayBuffer) {
      data = getArrayBuffer(data);
    }
    this.extensions[PerMessageDeflate.extensionName].compress(data, fin, callback);
  } else {
    callback(null, data);
  }
};

module.exports = Sender;

function writeUInt16BE(value, offset) {
  this[offset] = (value & 0xff00)>>8;
  this[offset+1] = value & 0xff;
}

function writeUInt32BE(value, offset) {
  this[offset] = (value & 0xff000000)>>24;
  this[offset+1] = (value & 0xff0000)>>16;
  this[offset+2] = (value & 0xff00)>>8;
  this[offset+3] = value & 0xff;
}

function getArrayBuffer(data) {
  // data is either an ArrayBuffer or ArrayBufferView.
  var array = new Uint8Array(data.buffer || data)
    , l = data.byteLength || data.length
    , o = data.byteOffset || 0
    , buffer = new Buffer(l);
  for (var i = 0; i < l; ++i) {
    buffer[i] = array[o+i];
  }
  return buffer;
}

function getRandomMask() {
  return new Buffer([
    ~~(Math.random() * 255),
    ~~(Math.random() * 255),
    ~~(Math.random() * 255),
    ~~(Math.random() * 255)
  ]);
}

}).call(this,require("buffer").Buffer)
},{"./BufferUtil":16,"./ErrorCodes":17,"./PerMessageDeflate":19,"buffer":4,"events":undefined,"util":undefined}],24:[function(require,module,exports){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

exports.Validation = {
  isValidUTF8: function(buffer) {
    return true;
  }
};

},{}],25:[function(require,module,exports){
'use strict';

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

try {
  module.exports = require('utf-8-validate');
} catch (e) {
  module.exports = require('./Validation.fallback');
}

},{"./Validation.fallback":24,"utf-8-validate":12}],26:[function(require,module,exports){
(function (process,Buffer){
'use strict';

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var url = require('url')
  , util = require('util')
  , http = require('http')
  , https = require('https')
  , crypto = require('crypto')
  , stream = require('stream')
  , Ultron = require('ultron')
  , Options = require('options')
  , Sender = require('./Sender')
  , Receiver = require('./Receiver')
  , SenderHixie = require('./Sender.hixie')
  , ReceiverHixie = require('./Receiver.hixie')
  , Extensions = require('./Extensions')
  , PerMessageDeflate = require('./PerMessageDeflate')
  , EventEmitter = require('events').EventEmitter;

/**
 * Constants
 */

// Default protocol version

var protocolVersion = 13;

// Close timeout

var closeTimeout = 30 * 1000; // Allow 30 seconds to terminate the connection cleanly

/**
 * WebSocket implementation
 *
 * @constructor
 * @param {String} address Connection address.
 * @param {String|Array} protocols WebSocket protocols.
 * @param {Object} options Additional connection options.
 * @api public
 */
function WebSocket(address, protocols, options) {
  if (this instanceof WebSocket === false) {
    return new WebSocket(address, protocols, options);
  }

  EventEmitter.call(this);

  if (protocols && !Array.isArray(protocols) && 'object' === typeof protocols) {
    // accept the "options" Object as the 2nd argument
    options = protocols;
    protocols = null;
  }

  if ('string' === typeof protocols) {
    protocols = [ protocols ];
  }

  if (!Array.isArray(protocols)) {
    protocols = [];
  }

  this._socket = null;
  this._ultron = null;
  this._closeReceived = false;
  this.bytesReceived = 0;
  this.readyState = null;
  this.supports = {};
  this.extensions = {};
  this._binaryType = 'nodebuffer';

  if (Array.isArray(address)) {
    initAsServerClient.apply(this, address.concat(options));
  } else {
    initAsClient.apply(this, [address, protocols, options]);
  }
}

/**
 * Inherits from EventEmitter.
 */
util.inherits(WebSocket, EventEmitter);

/**
 * Ready States
 */
["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function each(state, index) {
    WebSocket.prototype[state] = WebSocket[state] = index;
});

/**
 * Gracefully closes the connection, after sending a description message to the server
 *
 * @param {Object} data to be sent to the server
 * @api public
 */
WebSocket.prototype.close = function close(code, data) {
  if (this.readyState === WebSocket.CLOSED) return;

  if (this.readyState === WebSocket.CONNECTING) {
    this.readyState = WebSocket.CLOSED;
    return;
  }

  if (this.readyState === WebSocket.CLOSING) {
    if (this._closeReceived && this._isServer) {
      this.terminate();
    }
    return;
  }

  var self = this;
  try {
    this.readyState = WebSocket.CLOSING;
    this._closeCode = code;
    this._closeMessage = data;
    var mask = !this._isServer;
    this._sender.close(code, data, mask, function(err) {
      if (err) self.emit('error', err);

      if (self._closeReceived && self._isServer) {
        self.terminate();
      } else {
        // ensure that the connection is cleaned up even when no response of closing handshake.
        clearTimeout(self._closeTimer);
        self._closeTimer = setTimeout(cleanupWebsocketResources.bind(self, true), closeTimeout);
      }
    });
  } catch (e) {
    this.emit('error', e);
  }
};

/**
 * Pause the client stream
 *
 * @api public
 */
WebSocket.prototype.pause = function pauser() {
  if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

  return this._socket.pause();
};

/**
 * Sends a ping
 *
 * @param {Object} data to be sent to the server
 * @param {Object} Members - mask: boolean, binary: boolean
 * @param {boolean} dontFailWhenClosed indicates whether or not to throw if the connection isnt open
 * @api public
 */
WebSocket.prototype.ping = function ping(data, options, dontFailWhenClosed) {
  if (this.readyState !== WebSocket.OPEN) {
    if (dontFailWhenClosed === true) return;
    throw new Error('not opened');
  }

  options = options || {};

  if (typeof options.mask === 'undefined') options.mask = !this._isServer;

  this._sender.ping(data, options);
};

/**
 * Sends a pong
 *
 * @param {Object} data to be sent to the server
 * @param {Object} Members - mask: boolean, binary: boolean
 * @param {boolean} dontFailWhenClosed indicates whether or not to throw if the connection isnt open
 * @api public
 */
WebSocket.prototype.pong = function(data, options, dontFailWhenClosed) {
  if (this.readyState !== WebSocket.OPEN) {
    if (dontFailWhenClosed === true) return;
    throw new Error('not opened');
  }

  options = options || {};

  if (typeof options.mask === 'undefined') options.mask = !this._isServer;

  this._sender.pong(data, options);
};

/**
 * Resume the client stream
 *
 * @api public
 */
WebSocket.prototype.resume = function resume() {
  if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

  return this._socket.resume();
};

/**
 * Sends a piece of data
 *
 * @param {Object} data to be sent to the server
 * @param {Object} Members - mask: boolean, binary: boolean, compress: boolean
 * @param {function} Optional callback which is executed after the send completes
 * @api public
 */

WebSocket.prototype.send = function send(data, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (this.readyState !== WebSocket.OPEN) {
    if (typeof cb === 'function') cb(new Error('not opened'));
    else throw new Error('not opened');
    return;
  }

  if (!data) data = '';
  if (this._queue) {
    var self = this;
    this._queue.push(function() { self.send(data, options, cb); });
    return;
  }

  options = options || {};
  options.fin = true;

  if (typeof options.binary === 'undefined') {
    options.binary = (data instanceof ArrayBuffer || data instanceof Buffer ||
      data instanceof Uint8Array ||
      data instanceof Uint16Array ||
      data instanceof Uint32Array ||
      data instanceof Int8Array ||
      data instanceof Int16Array ||
      data instanceof Int32Array ||
      data instanceof Float32Array ||
      data instanceof Float64Array);
  }

  if (typeof options.mask === 'undefined') options.mask = !this._isServer;
  if (typeof options.compress === 'undefined') options.compress = true;
  if (!this.extensions[PerMessageDeflate.extensionName]) {
    options.compress = false;
  }

  var readable = typeof stream.Readable === 'function'
    ? stream.Readable
    : stream.Stream;

  if (data instanceof readable) {
    startQueue(this);
    var self = this;

    sendStream(this, data, options, function send(error) {
      process.nextTick(function tock() {
        executeQueueSends(self);
      });

      if (typeof cb === 'function') cb(error);
    });
  } else {
    this._sender.send(data, options, cb);
  }
};

/**
 * Streams data through calls to a user supplied function
 *
 * @param {Object} Members - mask: boolean, binary: boolean, compress: boolean
 * @param {function} 'function (error, send)' which is executed on successive ticks of which send is 'function (data, final)'.
 * @api public
 */
WebSocket.prototype.stream = function stream(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var self = this;

  if (typeof cb !== 'function') throw new Error('callback must be provided');

  if (this.readyState !== WebSocket.OPEN) {
    if (typeof cb === 'function') cb(new Error('not opened'));
    else throw new Error('not opened');
    return;
  }

  if (this._queue) {
    this._queue.push(function () { self.stream(options, cb); });
    return;
  }

  options = options || {};

  if (typeof options.mask === 'undefined') options.mask = !this._isServer;
  if (typeof options.compress === 'undefined') options.compress = true;
  if (!this.extensions[PerMessageDeflate.extensionName]) {
    options.compress = false;
  }

  startQueue(this);

  function send(data, final) {
    try {
      if (self.readyState !== WebSocket.OPEN) throw new Error('not opened');
      options.fin = final === true;
      self._sender.send(data, options);
      if (!final) process.nextTick(cb.bind(null, null, send));
      else executeQueueSends(self);
    } catch (e) {
      if (typeof cb === 'function') cb(e);
      else {
        delete self._queue;
        self.emit('error', e);
      }
    }
  }

  process.nextTick(cb.bind(null, null, send));
};

/**
 * Immediately shuts down the connection
 *
 * @api public
 */
WebSocket.prototype.terminate = function terminate() {
  if (this.readyState === WebSocket.CLOSED) return;

  if (this._socket) {
    this.readyState = WebSocket.CLOSING;

    // End the connection
    try { this._socket.end(); }
    catch (e) {
      // Socket error during end() call, so just destroy it right now
      cleanupWebsocketResources.call(this, true);
      return;
    }

    // Add a timeout to ensure that the connection is completely
    // cleaned up within 30 seconds, even if the clean close procedure
    // fails for whatever reason
    // First cleanup any pre-existing timeout from an earlier "terminate" call,
    // if one exists.  Otherwise terminate calls in quick succession will leak timeouts
    // and hold the program open for `closeTimout` time.
    if (this._closeTimer) { clearTimeout(this._closeTimer); }
    this._closeTimer = setTimeout(cleanupWebsocketResources.bind(this, true), closeTimeout);
  } else if (this.readyState === WebSocket.CONNECTING) {
    cleanupWebsocketResources.call(this, true);
  }
};

/**
 * Expose bufferedAmount
 *
 * @api public
 */
Object.defineProperty(WebSocket.prototype, 'bufferedAmount', {
  get: function get() {
    var amount = 0;
    if (this._socket) {
      amount = this._socket.bufferSize || 0;
    }
    return amount;
  }
});

/**
 * Expose binaryType
 *
 * This deviates from the W3C interface since ws doesn't support the required
 * default "blob" type (instead we define a custom "nodebuffer" type).
 *
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
Object.defineProperty(WebSocket.prototype, 'binaryType', {
  get: function get() {
    return this._binaryType;
  },
  set: function set(type) {
    if (type === 'arraybuffer' || type === 'nodebuffer')
      this._binaryType = type;
    else
      throw new SyntaxError('unsupported binaryType: must be either "nodebuffer" or "arraybuffer"');
  }
});

/**
 * Emulates the W3C Browser based WebSocket interface using function members.
 *
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
['open', 'error', 'close', 'message'].forEach(function(method) {
  Object.defineProperty(WebSocket.prototype, 'on' + method, {
    /**
     * Returns the current listener
     *
     * @returns {Mixed} the set function or undefined
     * @api public
     */
    get: function get() {
      var listener = this.listeners(method)[0];
      return listener ? (listener._listener ? listener._listener : listener) : undefined;
    },

    /**
     * Start listening for events
     *
     * @param {Function} listener the listener
     * @returns {Mixed} the set function or undefined
     * @api public
     */
    set: function set(listener) {
      this.removeAllListeners(method);
      this.addEventListener(method, listener);
    }
  });
});

/**
 * Emulates the W3C Browser based WebSocket interface using addEventListener.
 *
 * @see https://developer.mozilla.org/en/DOM/element.addEventListener
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
WebSocket.prototype.addEventListener = function(method, listener) {
  var target = this;

  function onMessage (data, flags) {
    if (flags.binary && this.binaryType === 'arraybuffer')
        data = new Uint8Array(data).buffer;
    listener.call(target, new MessageEvent(data, !!flags.binary, target));
  }

  function onClose (code, message) {
    listener.call(target, new CloseEvent(code, message, target));
  }

  function onError (event) {
    event.type = 'error';
    event.target = target;
    listener.call(target, event);
  }

  function onOpen () {
    listener.call(target, new OpenEvent(target));
  }

  if (typeof listener === 'function') {
    if (method === 'message') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onMessage._listener = listener;
      this.on(method, onMessage);
    } else if (method === 'close') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onClose._listener = listener;
      this.on(method, onClose);
    } else if (method === 'error') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onError._listener = listener;
      this.on(method, onError);
    } else if (method === 'open') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onOpen._listener = listener;
      this.on(method, onOpen);
    } else {
      this.on(method, listener);
    }
  }
};

module.exports = WebSocket;
module.exports.buildHostHeader = buildHostHeader

/**
 * W3C MessageEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function MessageEvent(dataArg, isBinary, target) {
  this.type = 'message';
  this.data = dataArg;
  this.target = target;
  this.binary = isBinary; // non-standard.
}

/**
 * W3C CloseEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function CloseEvent(code, reason, target) {
  this.type = 'close';
  this.wasClean = (typeof code === 'undefined' || code === 1000);
  this.code = code;
  this.reason = reason;
  this.target = target;
}

/**
 * W3C OpenEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function OpenEvent(target) {
  this.type = 'open';
  this.target = target;
}

// Append port number to Host header, only if specified in the url
// and non-default
function buildHostHeader(isSecure, hostname, port) {
  var headerHost = hostname;
  if (hostname) {
    if ((isSecure && (port != 443)) || (!isSecure && (port != 80))){
      headerHost = headerHost + ':' + port;
    }
  }
  return headerHost;
}

/**
 * Entirely private apis,
 * which may or may not be bound to a sepcific WebSocket instance.
 */
function initAsServerClient(req, socket, upgradeHead, options) {
  options = new Options({
    protocolVersion: protocolVersion,
    protocol: null,
    extensions: {},
    maxPayload: 0
  }).merge(options);

  // expose state properties
  this.protocol = options.value.protocol;
  this.protocolVersion = options.value.protocolVersion;
  this.extensions = options.value.extensions;
  this.supports.binary = (this.protocolVersion !== 'hixie-76');
  this.upgradeReq = req;
  this.readyState = WebSocket.CONNECTING;
  this._isServer = true;
  this.maxPayload = options.value.maxPayload;
  // establish connection
  if (options.value.protocolVersion === 'hixie-76') {
    establishConnection.call(this, ReceiverHixie, SenderHixie, socket, upgradeHead);
  } else {
    establishConnection.call(this, Receiver, Sender, socket, upgradeHead);
  }
}

function initAsClient(address, protocols, options) {
  options = new Options({
    origin: null,
    protocolVersion: protocolVersion,
    host: null,
    headers: null,
    protocol: protocols.join(','),
    agent: null,

    // ssl-related options
    pfx: null,
    key: null,
    passphrase: null,
    cert: null,
    ca: null,
    ciphers: null,
    rejectUnauthorized: null,
    perMessageDeflate: true,
    localAddress: null
  }).merge(options);

  if (options.value.protocolVersion !== 8 && options.value.protocolVersion !== 13) {
    throw new Error('unsupported protocol version');
  }

  // verify URL and establish http class
  var serverUrl = url.parse(address);
  var isUnixSocket = serverUrl.protocol === 'ws+unix:';
  if (!serverUrl.host && !isUnixSocket) throw new Error('invalid url');
  var isSecure = serverUrl.protocol === 'wss:' || serverUrl.protocol === 'https:';
  var httpObj = isSecure ? https : http;
  var port = serverUrl.port || (isSecure ? 443 : 80);
  var auth = serverUrl.auth;

  // prepare extensions
  var extensionsOffer = {};
  var perMessageDeflate;
  if (options.value.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate(typeof options.value.perMessageDeflate !== true ? options.value.perMessageDeflate : {}, false);
    extensionsOffer[PerMessageDeflate.extensionName] = perMessageDeflate.offer();
  }

  // expose state properties
  this._isServer = false;
  this.url = address;
  this.protocolVersion = options.value.protocolVersion;
  this.supports.binary = (this.protocolVersion !== 'hixie-76');

  // begin handshake
  var key = new Buffer(options.value.protocolVersion + '-' + Date.now()).toString('base64');
  var shasum = crypto.createHash('sha1');
  shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
  var expectedServerKey = shasum.digest('base64');

  var agent = options.value.agent;

  var headerHost = buildHostHeader(isSecure, serverUrl.hostname, port)

  var requestOptions = {
    port: port,
    host: serverUrl.hostname,
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket',
      'Host': headerHost,
      'Sec-WebSocket-Version': options.value.protocolVersion,
      'Sec-WebSocket-Key': key
    }
  };

  // If we have basic auth.
  if (auth) {
    requestOptions.headers.Authorization = 'Basic ' + new Buffer(auth).toString('base64');
  }

  if (options.value.protocol) {
    requestOptions.headers['Sec-WebSocket-Protocol'] = options.value.protocol;
  }

  if (options.value.host) {
    requestOptions.headers.Host = options.value.host;
  }

  if (options.value.headers) {
    for (var header in options.value.headers) {
       if (options.value.headers.hasOwnProperty(header)) {
        requestOptions.headers[header] = options.value.headers[header];
       }
    }
  }

  if (Object.keys(extensionsOffer).length) {
    requestOptions.headers['Sec-WebSocket-Extensions'] = Extensions.format(extensionsOffer);
  }

  if (options.isDefinedAndNonNull('pfx')
   || options.isDefinedAndNonNull('key')
   || options.isDefinedAndNonNull('passphrase')
   || options.isDefinedAndNonNull('cert')
   || options.isDefinedAndNonNull('ca')
   || options.isDefinedAndNonNull('ciphers')
   || options.isDefinedAndNonNull('rejectUnauthorized')) {

    if (options.isDefinedAndNonNull('pfx')) requestOptions.pfx = options.value.pfx;
    if (options.isDefinedAndNonNull('key')) requestOptions.key = options.value.key;
    if (options.isDefinedAndNonNull('passphrase')) requestOptions.passphrase = options.value.passphrase;
    if (options.isDefinedAndNonNull('cert')) requestOptions.cert = options.value.cert;
    if (options.isDefinedAndNonNull('ca')) requestOptions.ca = options.value.ca;
    if (options.isDefinedAndNonNull('ciphers')) requestOptions.ciphers = options.value.ciphers;
    if (options.isDefinedAndNonNull('rejectUnauthorized')) requestOptions.rejectUnauthorized = options.value.rejectUnauthorized;

    if (!agent) {
        // global agent ignores client side certificates
        agent = new httpObj.Agent(requestOptions);
    }
  }

  requestOptions.path = serverUrl.path || '/';

  if (agent) {
    requestOptions.agent = agent;
  }

  if (isUnixSocket) {
    requestOptions.socketPath = serverUrl.pathname;
  }

  if (options.value.localAddress) {
    requestOptions.localAddress = options.value.localAddress;
  }

  if (options.value.origin) {
    if (options.value.protocolVersion < 13) requestOptions.headers['Sec-WebSocket-Origin'] = options.value.origin;
    else requestOptions.headers.Origin = options.value.origin;
  }

  var self = this;
  var req = httpObj.request(requestOptions);

  req.on('error', function onerror(error) {
    self.emit('error', error);
    cleanupWebsocketResources.call(self, error);
  });

  req.once('response', function response(res) {
    var error;

    if (!self.emit('unexpected-response', req, res)) {
      error = new Error('unexpected server response (' + res.statusCode + ')');
      req.abort();
      self.emit('error', error);
    }

    cleanupWebsocketResources.call(self, error);
  });

  req.once('upgrade', function upgrade(res, socket, upgradeHead) {
    if (self.readyState === WebSocket.CLOSED) {
      // client closed before server accepted connection
      self.emit('close');
      self.removeAllListeners();
      socket.end();
      return;
    }

    var serverKey = res.headers['sec-websocket-accept'];
    if (typeof serverKey === 'undefined' || serverKey !== expectedServerKey) {
      self.emit('error', 'invalid server key');
      self.removeAllListeners();
      socket.end();
      return;
    }

    var serverProt = res.headers['sec-websocket-protocol'];
    var protList = (options.value.protocol || "").split(/, */);
    var protError = null;

    if (!options.value.protocol && serverProt) {
      protError = 'server sent a subprotocol even though none requested';
    } else if (options.value.protocol && !serverProt) {
      protError = 'server sent no subprotocol even though requested';
    } else if (serverProt && protList.indexOf(serverProt) === -1) {
      protError = 'server responded with an invalid protocol';
    }

    if (protError) {
      self.emit('error', protError);
      self.removeAllListeners();
      socket.end();
      return;
    } else if (serverProt) {
      self.protocol = serverProt;
    }

    var serverExtensions = Extensions.parse(res.headers['sec-websocket-extensions']);
    if (perMessageDeflate && serverExtensions[PerMessageDeflate.extensionName]) {
      try {
        perMessageDeflate.accept(serverExtensions[PerMessageDeflate.extensionName]);
      } catch (err) {
        self.emit('error', 'invalid extension parameter');
        self.removeAllListeners();
        socket.end();
        return;
      }
      self.extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
    }

    establishConnection.call(self, Receiver, Sender, socket, upgradeHead);

    // perform cleanup on http resources
    req.removeAllListeners();
    req = null;
    agent = null;
  });

  req.end();
  this.readyState = WebSocket.CONNECTING;
}

function establishConnection(ReceiverClass, SenderClass, socket, upgradeHead) {
  var ultron = this._ultron = new Ultron(socket)
    , called = false
    , self = this;

  socket.setTimeout(0);
  socket.setNoDelay(true);

  this._receiver = new ReceiverClass(this.extensions,this.maxPayload);
  this._socket = socket;

  // socket cleanup handlers
  ultron.on('end', cleanupWebsocketResources.bind(this));
  ultron.on('close', cleanupWebsocketResources.bind(this));
  ultron.on('error', cleanupWebsocketResources.bind(this));

  // ensure that the upgradeHead is added to the receiver
  function firstHandler(data) {
    if (called || self.readyState === WebSocket.CLOSED) return;

    called = true;
    socket.removeListener('data', firstHandler);
    ultron.on('data', realHandler);

    if (upgradeHead && upgradeHead.length > 0) {
      realHandler(upgradeHead);
      upgradeHead = null;
    }

    if (data) realHandler(data);
  }

  // subsequent packets are pushed straight to the receiver
  function realHandler(data) {
    self.bytesReceived += data.length;
    self._receiver.add(data);
  }

  ultron.on('data', firstHandler);

  // if data was passed along with the http upgrade,
  // this will schedule a push of that on to the receiver.
  // this has to be done on next tick, since the caller
  // hasn't had a chance to set event handlers on this client
  // object yet.
  process.nextTick(firstHandler);

  // receiver event handlers
  self._receiver.ontext = function ontext(data, flags) {
    flags = flags || {};

    self.emit('message', data, flags);
  };

  self._receiver.onbinary = function onbinary(data, flags) {
    flags = flags || {};

    flags.binary = true;
    self.emit('message', data, flags);
  };

  self._receiver.onping = function onping(data, flags) {
    flags = flags || {};

    self.pong(data, {
      mask: !self._isServer,
      binary: flags.binary === true
    }, true);

    self.emit('ping', data, flags);
  };

  self._receiver.onpong = function onpong(data, flags) {
    self.emit('pong', data, flags || {});
  };

  self._receiver.onclose = function onclose(code, data, flags) {
    flags = flags || {};

    self._closeReceived = true;
    self.close(code, data);
  };

  self._receiver.onerror = function onerror(reason, errorCode) {
    // close the connection when the receiver reports a HyBi error code
    self.close(typeof errorCode !== 'undefined' ? errorCode : 1002, '');
    self.emit('error', (reason instanceof Error) ? reason : (new Error(reason)));
  };

  // finalize the client
  this._sender = new SenderClass(socket, this.extensions);
  this._sender.on('error', function onerror(error) {
    self.close(1002, '');
    self.emit('error', error);
  });

  this.readyState = WebSocket.OPEN;
  this.emit('open');
}

function startQueue(instance) {
  instance._queue = instance._queue || [];
}

function executeQueueSends(instance) {
  var queue = instance._queue;
  if (typeof queue === 'undefined') return;

  delete instance._queue;
  for (var i = 0, l = queue.length; i < l; ++i) {
    queue[i]();
  }
}

function sendStream(instance, stream, options, cb) {
  stream.on('data', function incoming(data) {
    if (instance.readyState !== WebSocket.OPEN) {
      if (typeof cb === 'function') cb(new Error('not opened'));
      else {
        delete instance._queue;
        instance.emit('error', new Error('not opened'));
      }
      return;
    }

    options.fin = false;
    instance._sender.send(data, options);
  });

  stream.on('end', function end() {
    if (instance.readyState !== WebSocket.OPEN) {
      if (typeof cb === 'function') cb(new Error('not opened'));
      else {
        delete instance._queue;
        instance.emit('error', new Error('not opened'));
      }
      return;
    }

    options.fin = true;
    instance._sender.send(null, options);

    if (typeof cb === 'function') cb(null);
  });
}

function cleanupWebsocketResources(error) {
  if (this.readyState === WebSocket.CLOSED) return;

  this.readyState = WebSocket.CLOSED;

  clearTimeout(this._closeTimer);
  this._closeTimer = null;

  // If the connection was closed abnormally (with an error), or if
  // the close control frame was not received then the close code
  // must default to 1006.
  if (error || !this._closeReceived) {
    this._closeCode = 1006;
  }
  this.emit('close', this._closeCode || 1000, this._closeMessage || '');

  if (this._socket) {
    if (this._ultron) this._ultron.destroy();
    this._socket.on('error', function onerror() {
      try { this.destroy(); }
      catch (e) {}
    });

    try {
      if (!error) this._socket.end();
      else this._socket.destroy();
    } catch (e) { /* Ignore termination errors */ }

    this._socket = null;
    this._ultron = null;
  }

  if (this._sender) {
    this._sender.removeAllListeners();
    this._sender = null;
  }

  if (this._receiver) {
    this._receiver.cleanup();
    this._receiver = null;
  }

  if (this.extensions[PerMessageDeflate.extensionName]) {
    this.extensions[PerMessageDeflate.extensionName].cleanup();
  }

  this.extensions = null;

  this.removeAllListeners();
  this.on('error', function onerror() {}); // catch all errors after this
  delete this._queue;
}

}).call(this,require('_process'),require("buffer").Buffer)
},{"./Extensions":18,"./PerMessageDeflate":19,"./Receiver":21,"./Receiver.hixie":20,"./Sender":23,"./Sender.hixie":22,"_process":3,"buffer":4,"crypto":undefined,"events":undefined,"http":undefined,"https":undefined,"options":9,"stream":undefined,"ultron":10,"url":undefined,"util":undefined}],27:[function(require,module,exports){
(function (Buffer){
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

var util = require('util')
  , events = require('events')
  , http = require('http')
  , crypto = require('crypto')
  , Options = require('options')
  , WebSocket = require('./WebSocket')
  , Extensions = require('./Extensions')
  , PerMessageDeflate = require('./PerMessageDeflate')
  , tls = require('tls')
  , url = require('url');

/**
 * WebSocket Server implementation
 */

function WebSocketServer(options, callback) {
  if (this instanceof WebSocketServer === false) {
    return new WebSocketServer(options, callback);
  }

  events.EventEmitter.call(this);

  options = new Options({
    host: '0.0.0.0',
    port: null,
    server: null,
    verifyClient: null,
    handleProtocols: null,
    path: null,
    noServer: false,
    disableHixie: false,
    clientTracking: true,
    perMessageDeflate: true,
    maxPayload: 100 * 1024 * 1024
  }).merge(options);

  if (!options.isDefinedAndNonNull('port') && !options.isDefinedAndNonNull('server') && !options.value.noServer) {
    throw new TypeError('`port` or a `server` must be provided');
  }

  var self = this;

  if (options.isDefinedAndNonNull('port')) {
    this._server = http.createServer(function (req, res) {
      var body = http.STATUS_CODES[426];
      res.writeHead(426, {
        'Content-Length': body.length,
        'Content-Type': 'text/plain'
      });
      res.end(body);
    });
    this._server.allowHalfOpen = false;
    this._server.listen(options.value.port, options.value.host, callback);
    this._closeServer = function() { if (self._server) self._server.close(); };
  }
  else if (options.value.server) {
    this._server = options.value.server;
    if (options.value.path) {
      // take note of the path, to avoid collisions when multiple websocket servers are
      // listening on the same http server
      if (this._server._webSocketPaths && options.value.server._webSocketPaths[options.value.path]) {
        throw new Error('two instances of WebSocketServer cannot listen on the same http server path');
      }
      if (typeof this._server._webSocketPaths !== 'object') {
        this._server._webSocketPaths = {};
      }
      this._server._webSocketPaths[options.value.path] = 1;
    }
  }
  if (this._server) {
    this._onceServerListening = function() { self.emit('listening'); };
    this._server.once('listening', this._onceServerListening);
  }

  if (typeof this._server != 'undefined') {
    this._onServerError = function(error) { self.emit('error', error) };
    this._server.on('error', this._onServerError);
    this._onServerUpgrade = function(req, socket, upgradeHead) {
      //copy upgradeHead to avoid retention of large slab buffers used in node core
      var head = new Buffer(upgradeHead.length);
      upgradeHead.copy(head);

      self.handleUpgrade(req, socket, head, function(client) {
        self.emit('connection'+req.url, client);
        self.emit('connection', client);
      });
    };
    this._server.on('upgrade', this._onServerUpgrade);
  }

  this.options = options.value;
  this.path = options.value.path;
  this.clients = [];
}

/**
 * Inherits from EventEmitter.
 */

util.inherits(WebSocketServer, events.EventEmitter);

/**
 * Immediately shuts down the connection.
 *
 * @api public
 */

WebSocketServer.prototype.close = function(callback) {
  // terminate all associated clients
  var error = null;
  try {
    for (var i = 0, l = this.clients.length; i < l; ++i) {
      this.clients[i].terminate();
    }
  }
  catch (e) {
    error = e;
  }

  // remove path descriptor, if any
  if (this.path && this._server._webSocketPaths) {
    delete this._server._webSocketPaths[this.path];
    if (Object.keys(this._server._webSocketPaths).length == 0) {
      delete this._server._webSocketPaths;
    }
  }

  // close the http server if it was internally created
  try {
    if (typeof this._closeServer !== 'undefined') {
      this._closeServer();
    }
  }
  finally {
    if (this._server) {
      this._server.removeListener('listening', this._onceServerListening);
      this._server.removeListener('error', this._onServerError);
      this._server.removeListener('upgrade', this._onServerUpgrade);
    }
    delete this._server;
  }
  if(callback)
    callback(error);
  else if(error)
    throw error;
}

/**
 * Handle a HTTP Upgrade request.
 *
 * @api public
 */

WebSocketServer.prototype.handleUpgrade = function(req, socket, upgradeHead, cb) {
  // check for wrong path
  if (this.options.path) {
    var u = url.parse(req.url);
    if (u && u.pathname !== this.options.path) return;
  }

  if (typeof req.headers.upgrade === 'undefined' || req.headers.upgrade.toLowerCase() !== 'websocket') {
    abortConnection(socket, 400, 'Bad Request');
    return;
  }

  if (req.headers['sec-websocket-key1']) handleHixieUpgrade.apply(this, arguments);
  else handleHybiUpgrade.apply(this, arguments);
}

module.exports = WebSocketServer;

/**
 * Entirely private apis,
 * which may or may not be bound to a sepcific WebSocket instance.
 */

function handleHybiUpgrade(req, socket, upgradeHead, cb) {
  // handle premature socket errors
  var errorHandler = function() {
    try { socket.destroy(); } catch (e) {}
  }
  socket.on('error', errorHandler);

  // verify key presence
  if (!req.headers['sec-websocket-key']) {
    abortConnection(socket, 400, 'Bad Request');
    return;
  }

  // verify version
  var version = parseInt(req.headers['sec-websocket-version']);
  if ([8, 13].indexOf(version) === -1) {
    abortConnection(socket, 400, 'Bad Request');
    return;
  }

  // verify protocol
  var protocols = req.headers['sec-websocket-protocol'];

  // verify client
  var origin = version < 13 ?
    req.headers['sec-websocket-origin'] :
    req.headers['origin'];

  // handle extensions offer
  var extensionsOffer = Extensions.parse(req.headers['sec-websocket-extensions']);

  // handler to call when the connection sequence completes
  var self = this;
  var completeHybiUpgrade2 = function(protocol) {

    // calc key
    var key = req.headers['sec-websocket-key'];
    var shasum = crypto.createHash('sha1');
    shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
    key = shasum.digest('base64');

    var headers = [
        'HTTP/1.1 101 Switching Protocols'
      , 'Upgrade: websocket'
      , 'Connection: Upgrade'
      , 'Sec-WebSocket-Accept: ' + key
    ];

    if (typeof protocol != 'undefined') {
      headers.push('Sec-WebSocket-Protocol: ' + protocol);
    }

    var extensions = {};
    try {
      extensions = acceptExtensions.call(self, extensionsOffer);
    } catch (err) {
      abortConnection(socket, 400, 'Bad Request');
      return;
    }

    if (Object.keys(extensions).length) {
      var serverExtensions = {};
      Object.keys(extensions).forEach(function(token) {
        serverExtensions[token] = [extensions[token].params]
      });
      headers.push('Sec-WebSocket-Extensions: ' + Extensions.format(serverExtensions));
    }

    // allows external modification/inspection of handshake headers
    self.emit('headers', headers);

    socket.setTimeout(0);
    socket.setNoDelay(true);
    try {
      socket.write(headers.concat('', '').join('\r\n'));
    }
    catch (e) {
      // if the upgrade write fails, shut the connection down hard
      try { socket.destroy(); } catch (e) {}
      return;
    }

    var client = new WebSocket([req, socket, upgradeHead], {
      protocolVersion: version,
      protocol: protocol,
      extensions: extensions,
      maxPayload: self.options.maxPayload
    });

    if (self.options.clientTracking) {
      self.clients.push(client);
      client.on('close', function() {
        var index = self.clients.indexOf(client);
        if (index != -1) {
          self.clients.splice(index, 1);
        }
      });
    }

    // signal upgrade complete
    socket.removeListener('error', errorHandler);
    cb(client);
  }

  // optionally call external protocol selection handler before
  // calling completeHybiUpgrade2
  var completeHybiUpgrade1 = function() {
    // choose from the sub-protocols
    if (typeof self.options.handleProtocols == 'function') {
        var protList = (protocols || "").split(/, */);
        var callbackCalled = false;
        var res = self.options.handleProtocols(protList, function(result, protocol) {
          callbackCalled = true;
          if (!result) abortConnection(socket, 401, 'Unauthorized');
          else completeHybiUpgrade2(protocol);
        });
        if (!callbackCalled) {
            // the handleProtocols handler never called our callback
            abortConnection(socket, 501, 'Could not process protocols');
        }
        return;
    } else {
        if (typeof protocols !== 'undefined') {
            completeHybiUpgrade2(protocols.split(/, */)[0]);
        }
        else {
            completeHybiUpgrade2();
        }
    }
  }

  // optionally call external client verification handler
  if (typeof this.options.verifyClient == 'function') {
    var info = {
      origin: origin,
      secure: typeof req.connection.authorized !== 'undefined' || typeof req.connection.encrypted !== 'undefined',
      req: req
    };
    if (this.options.verifyClient.length == 2) {
      this.options.verifyClient(info, function(result, code, name) {
        if (typeof code === 'undefined') code = 401;
        if (typeof name === 'undefined') name = http.STATUS_CODES[code];

        if (!result) abortConnection(socket, code, name);
        else completeHybiUpgrade1();
      });
      return;
    }
    else if (!this.options.verifyClient(info)) {
      abortConnection(socket, 401, 'Unauthorized');
      return;
    }
  }

  completeHybiUpgrade1();
}

function handleHixieUpgrade(req, socket, upgradeHead, cb) {
  // handle premature socket errors
  var errorHandler = function() {
    try { socket.destroy(); } catch (e) {}
  }
  socket.on('error', errorHandler);

  // bail if options prevent hixie
  if (this.options.disableHixie) {
    abortConnection(socket, 401, 'Hixie support disabled');
    return;
  }

  // verify key presence
  if (!req.headers['sec-websocket-key2']) {
    abortConnection(socket, 400, 'Bad Request');
    return;
  }

  var origin = req.headers['origin']
    , self = this;

  // setup handshake completion to run after client has been verified
  var onClientVerified = function() {
    var wshost;
    if (!req.headers['x-forwarded-host'])
        wshost = req.headers.host;
    else
        wshost = req.headers['x-forwarded-host'];
    var location = ((req.headers['x-forwarded-proto'] === 'https' || socket.encrypted) ? 'wss' : 'ws') + '://' + wshost + req.url
      , protocol = req.headers['sec-websocket-protocol'];

    // build the response header and return a Buffer
    var buildResponseHeader = function() {
      var headers = [
          'HTTP/1.1 101 Switching Protocols'
        , 'Upgrade: WebSocket'
        , 'Connection: Upgrade'
        , 'Sec-WebSocket-Location: ' + location
      ];
      if (typeof protocol != 'undefined') headers.push('Sec-WebSocket-Protocol: ' + protocol);
      if (typeof origin != 'undefined') headers.push('Sec-WebSocket-Origin: ' + origin);

      return new Buffer(headers.concat('', '').join('\r\n'));
    };

    // send handshake response before receiving the nonce
    var handshakeResponse = function() {

      socket.setTimeout(0);
      socket.setNoDelay(true);

      var headerBuffer = buildResponseHeader();

      try {
        socket.write(headerBuffer, 'binary', function(err) {
          // remove listener if there was an error
          if (err) socket.removeListener('data', handler);
          return;
        });
      } catch (e) {
        try { socket.destroy(); } catch (e) {}
        return;
      };
    };

    // handshake completion code to run once nonce has been successfully retrieved
    var completeHandshake = function(nonce, rest, headerBuffer) {
      // calculate key
      var k1 = req.headers['sec-websocket-key1']
        , k2 = req.headers['sec-websocket-key2']
        , md5 = crypto.createHash('md5');

      [k1, k2].forEach(function (k) {
        var n = parseInt(k.replace(/[^\d]/g, ''))
          , spaces = k.replace(/[^ ]/g, '').length;
        if (spaces === 0 || n % spaces !== 0){
          abortConnection(socket, 400, 'Bad Request');
          return;
        }
        n /= spaces;
        md5.update(String.fromCharCode(
          n >> 24 & 0xFF,
          n >> 16 & 0xFF,
          n >> 8  & 0xFF,
          n       & 0xFF));
      });
      md5.update(nonce.toString('binary'));

      socket.setTimeout(0);
      socket.setNoDelay(true);

      try {
        var hashBuffer = new Buffer(md5.digest('binary'), 'binary');
        var handshakeBuffer = new Buffer(headerBuffer.length + hashBuffer.length);
        headerBuffer.copy(handshakeBuffer, 0);
        hashBuffer.copy(handshakeBuffer, headerBuffer.length);

        // do a single write, which - upon success - causes a new client websocket to be setup
        socket.write(handshakeBuffer, 'binary', function(err) {
          if (err) return; // do not create client if an error happens
          var client = new WebSocket([req, socket, rest], {
            protocolVersion: 'hixie-76',
            protocol: protocol
          });
          if (self.options.clientTracking) {
            self.clients.push(client);
            client.on('close', function() {
              var index = self.clients.indexOf(client);
              if (index != -1) {
                self.clients.splice(index, 1);
              }
            });
          }

          // signal upgrade complete
          socket.removeListener('error', errorHandler);
          cb(client);
        });
      }
      catch (e) {
        try { socket.destroy(); } catch (e) {}
        return;
      }
    }

    // retrieve nonce
    var nonceLength = 8;
    if (upgradeHead && upgradeHead.length >= nonceLength) {
      var nonce = upgradeHead.slice(0, nonceLength);
      var rest = upgradeHead.length > nonceLength ? upgradeHead.slice(nonceLength) : null;
      completeHandshake.call(self, nonce, rest, buildResponseHeader());
    }
    else {
      // nonce not present in upgradeHead
      var nonce = new Buffer(nonceLength);
      upgradeHead.copy(nonce, 0);
      var received = upgradeHead.length;
      var rest = null;
      var handler = function (data) {
        var toRead = Math.min(data.length, nonceLength - received);
        if (toRead === 0) return;
        data.copy(nonce, received, 0, toRead);
        received += toRead;
        if (received == nonceLength) {
          socket.removeListener('data', handler);
          if (toRead < data.length) rest = data.slice(toRead);

          // complete the handshake but send empty buffer for headers since they have already been sent
          completeHandshake.call(self, nonce, rest, new Buffer(0));
        }
      }

      // handle additional data as we receive it
      socket.on('data', handler);

      // send header response before we have the nonce to fix haproxy buffering
      handshakeResponse();
    }
  }

  // verify client
  if (typeof this.options.verifyClient == 'function') {
    var info = {
      origin: origin,
      secure: typeof req.connection.authorized !== 'undefined' || typeof req.connection.encrypted !== 'undefined',
      req: req
    };
    if (this.options.verifyClient.length == 2) {
      var self = this;
      this.options.verifyClient(info, function(result, code, name) {
        if (typeof code === 'undefined') code = 401;
        if (typeof name === 'undefined') name = http.STATUS_CODES[code];

        if (!result) abortConnection(socket, code, name);
        else onClientVerified.apply(self);
      });
      return;
    }
    else if (!this.options.verifyClient(info)) {
      abortConnection(socket, 401, 'Unauthorized');
      return;
    }
  }

  // no client verification required
  onClientVerified();
}

function acceptExtensions(offer) {
  var extensions = {};
  var options = this.options.perMessageDeflate;
  var maxPayload = this.options.maxPayload;
  if (options && offer[PerMessageDeflate.extensionName]) {
    var perMessageDeflate = new PerMessageDeflate(options !== true ? options : {}, true, maxPayload);
    perMessageDeflate.accept(offer[PerMessageDeflate.extensionName]);
    extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
  }
  return extensions;
}

function abortConnection(socket, code, name) {
  try {
    var response = [
      'HTTP/1.1 ' + code + ' ' + name,
      'Content-type: text/html'
    ];
    socket.write(response.concat('', '').join('\r\n'));
  }
  catch (e) { /* ignore errors - we've aborted this connection */ }
  finally {
    // ensure that an early aborted connection is shut down completely
    try { socket.destroy(); } catch (e) {}
  }
}

}).call(this,require("buffer").Buffer)
},{"./Extensions":18,"./PerMessageDeflate":19,"./WebSocket":26,"buffer":4,"crypto":undefined,"events":undefined,"http":undefined,"options":9,"tls":undefined,"url":undefined,"util":undefined}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCBot = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _protocol = require('./protocol');

var _utils = require('./utils');

var _httpRequest = require('./httpRequest');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCBot = exports.SCBot = function () {
    function SCBot(botId) {
        _classCallCheck(this, SCBot);

        this.botId = botId;
    }

    _createClass(SCBot, [{
        key: 'send',
        value: function send(data) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocol = _protocol.BotProtocol.init(this.botId);
            protocol.setData(data);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute();
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }]);

    return SCBot;
}();

},{"./httpRequest":32,"./protocol":40,"./utils":48}],29:[function(require,module,exports){
(function (Buffer){
'use strict';
/*
 * https://github.com/mongodb/js-bson/blob/master/alternate_parsers/faster_bson.js
 * */

Object.defineProperty(exports, "__esModule", {
    value: true
});
var JS_INT_MAX = 0x20000000000000;
var JS_INT_MIN = -0x20000000000000;

var Long = require('./long');
var ObjectID = require('./objectid');

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

}).call(this,require("buffer").Buffer)
},{"./long":35,"./objectid":38,"buffer":4}],30:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sharedInstance = void 0;
var SDKOptions = exports.SDKOptions = {
    WSHOST: 'wss.scorocode.ru',
    WS_PROTOCOL: 'wss',
    HOST: 'api.scorocode.ru',
    PORT: '443',

    CREATE_INSTANCE_URL: '/api/v1/instance/create',
    UPDATE_INSTANCE_URL: '/api/v1/instance/update',
    REMOVE_INSTANCE_URL: '/api/v1/instance/delete',
    RUN_INSTANCE_URL: '/api/v1/instance/run',
    STOP_INSTANCE_URL: '/api/v1/instance/stop',
    LIST_INSTANCE_URL: '/api/v1/instance',
    SCRIPTS_INSTANCE_URL: '/api/v1/instance/scripts',
    RUN_SCRIPT_INSTANCE_URL: '/api/v1/instance/scripts/run',
    KILL_SCRIPT_INSTANCE_URL: '/api/v1/instance/scripts/delete',

    GET_AUTH_URL: '/api/v1/verifylogin',

    FIND_URL: '/api/v1/data/find',
    COUNT_URL: '/api/v1/data/count',
    UPDATE_URL: '/api/v1/data/update',
    UPDATE_BY_ID_URL: '/api/v1/data/updatebyid',
    REMOVE_URL: '/api/v1/data/remove',
    INSERT_URL: '/api/v1/data/insert',

    SEND_PUSH_URL: '/api/v1/sendpush',
    SEND_SMS_URL: '/api/v1/sendsms',

    CLOUD_CODE_URL: '/api/v1/scripts',

    UPLOAD_URL: '/api/v1/upload',
    REMOVE_FILE_URL: '/api/v1/deletefile',
    GET_FILE_LINK_URL: '',

    SIGN_UP_URL: '/api/v1/register',
    LOGOUT_URL: '/api/v1/logout',
    LOGIN_URL: '/api/v1/login',

    DATA_STATS: '/api/v1/stat',

    BOT_HOST: 'bots.scorocode.ru',
    BOT_URL: '/bots/',

    /* Работа с приложением */
    GET_APP_URL: '/api/v1/app',
    UPDATE_APP_KEY: '/api/v1/app/keys/update',
    GET_COLLECTIONS_URL: '/api/v1/app/collections',
    GET_COLLECTION_URL: '/api/v1/app/collections/get',
    CREATE_COLLECTION_URL: '/api/v1/app/collections/create',
    UPDATE_COLLECTION_URL: '/api/v1/app/collections/update',
    DELETE_COLLECTION_URL: '/api/v1/app/collections/delete',
    CLONE_COLLECTION_URL: '/api/v1/app/collections/clone',
    CREATE_INDEX_URL: '/api/v1/app/collections/index/create',
    DELETE_INDEX_URL: '/api/v1/app/collections/index/delete',
    CREATE_FIELD_URL: '/api/v1/app/collections/fields/create',
    UPDATE_FIELD_URL: '/api/v1/app/collections/fields/update',
    DELETE_FIELD_URL: '/api/v1/app/collections/fields/delete',
    UPDATE_TRIGGERS_URL: '/api/v1/app/collections/triggers',
    GET_FOLDERS_URL: '/api/v1/app/scripts/folders',
    CREATE_FOLDER_URL: '/api/v1/app/scripts/folders/create',
    DELETE_FOLDER_URL: '/api/v1/app/scripts/folders/delete',
    GET_SCRIPT_URL: '/api/v1/app/scripts/get',
    CREATE_SCRIPT_URL: '/api/v1/app/scripts/create',
    UPDATE_SCRIPT_URL: '/api/v1/app/scripts/update',
    DELETE_SCRIPT_URL: '/api/v1/app/scripts/delete',
    GET_BOTS_URL: '/api/v1/bots',
    CREATE_BOT_URL: '/api/v1/bots/create',
    UPDATE_BOT_URL: '/api/v1/bots/update',
    DELETE_BOT_URL: '/api/v1/bots/delete',
    TIMEOUT: 120000

};

var Client = exports.Client = function () {
    function Client(options) {
        _classCallCheck(this, Client);

        if (typeof options.ApplicationID !== 'string') {
            throw new Error('Invalid Application ID');
        }

        if (typeof options.JavaScriptKey !== 'string') {
            throw new Error('Invalid JavaScript Key');
        }

        if (options.MasterKey && typeof options.MasterKey !== 'string') {
            throw new Error('Invalid MasterKey');
        }

        this.applicationID = options.ApplicationID;
        this.clientKey = options.JavaScriptKey;
        this.masterKey = options.MasterKey || "";
        this.messageKey = options.MessageKey || "";
        this.scriptKey = options.ScriptKey || "";
        this.fileKey = options.FileKey || "";
        this.websocketKey = options.WebSocketKey || "";
        this.sessionId = options.sessionId || "";

        this.host = "https://scorocode.ru";
        this.port = "443";

        /* Not implemented yet */
        if (options.EncryptKey && typeof options.EncryptKey !== 'string') {
            throw new Error('Invalid EncryptKey');
        }
        this.EncryptKey = '';
        this.isNode = false;

        if ((typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && process + '' === '[object process]') {
            this.isNode = true;
        }
    }

    _createClass(Client, [{
        key: 'get',
        value: function get(key) {
            return SDKOptions[key];
        }
    }, {
        key: 'set',
        value: function set(key, value) {
            SDKOptions[key] = value;
        }
    }], [{
        key: 'init',
        value: function init(options) {
            var client = new Client(options);
            sharedInstance = client;
            return client;
        }
    }, {
        key: 'getInstance',
        value: function getInstance() {
            return sharedInstance;
        }
    }]);

    return Client;
}();

}).call(this,require('_process'))
},{"_process":3}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCCloudCode = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _protocol = require('./protocol');

var _utils = require('./utils');

var _httpRequest = require('./httpRequest');

var _client = require('./client');

var _websocket = require('./websocket');

var _logger = require('./logger');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCCloudCode = exports.SCCloudCode = function () {
    function SCCloudCode(id) {
        var _this = this;

        var opt = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, SCCloudCode);

        if (typeof id !== 'string') {
            throw new Error('Invalid script id');
        }
        this.debugChannel = ('0' + Math.random() * 10000000).slice(-7);

        if (opt.logger instanceof _logger.SCLogger) {
            this.logger = opt.logger;
            this._ws = new _websocket.SCWebSocket(this.debugChannel);
            this._ws.on("open", function () {});
            this._ws.on("error", function (err) {
                _this.logger.error(err);
            });
            this._ws.on("message", function (msg) {
                _this.logger.log(msg);
            });
        }

        this.isRunByPath = !!opt.isRunByPath;
        this.id = id;
    }

    _createClass(SCCloudCode, [{
        key: 'runSync',
        value: function runSync() {
            var pool = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var callbacks = arguments[1];

            if ((typeof pool === 'undefined' ? 'undefined' : _typeof(pool)) !== 'object') {
                throw new Error('Invalid type of pool');
            }

            var protocolOpts = {
                url: _client.SDKOptions.CLOUD_CODE_URL
            };

            var channelId = parseInt(Math.random() * 10000000);

            var protocol = _protocol.CloudCodeProtocol.init({
                script: this.isRunByPath ? "" : this.id,
                isRunByPath: this.isRunByPath,
                path: this.isRunByPath ? this.id : "",
                pool: Object.assign({ channelId: channelId }, pool),
                debug: false
            }, protocolOpts);

            var promise = new Promise(function (resolve, reject) {
                var request = new _httpRequest.HttpRequest(protocol);
                var ws = new _websocket.SCWebSocket(channelId);

                var timeout = setTimeout(function () {
                    ws.wsInstanse.close();
                    clearTimeout(timeout);
                    reject({ errMsg: 'Gateway Timeout', errCode: 504, error: true });
                }, 120000);

                ws.on("open", function () {
                    request.execute().then(function (data) {
                        return JSON.parse(data);
                    }).then(function (response) {
                        if (response.error) {
                            return reject(response);
                        }
                    });
                });
                ws.on("error", function (err) {
                    return reject(err);
                });
                ws.on("message", function (msg) {
                    ws.wsInstanse.close();
                    clearTimeout(timeout);
                    return resolve(msg);
                });
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'run',
        value: function run() {
            var pool = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var debug = arguments[1];
            var callbacks = arguments[2];

            if ((typeof pool === 'undefined' ? 'undefined' : _typeof(pool)) !== 'object') {
                throw new Error('Invalid type of pool');
            }

            if ((typeof debug === 'undefined' ? 'undefined' : _typeof(debug)) === 'object') {
                callbacks = debug;
            }

            var protocolOpts = {
                url: _client.SDKOptions.CLOUD_CODE_URL
            };

            var protocol = _protocol.CloudCodeProtocol.init({
                isRunByPath: this.isRunByPath,
                script: this.isRunByPath ? "" : this.id,
                path: this.isRunByPath ? this.id : "",
                pool: pool,
                debug: debug,
                debugChannel: this.debugChannel
            }, protocolOpts);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }]);

    return SCCloudCode;
}();

},{"./client":30,"./httpRequest":32,"./logger":34,"./protocol":40,"./utils":48,"./websocket":49}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpRequest = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var https = null;
if (typeof XMLHttpRequest === 'undefined') {
    https = require('https');
}

var HttpRequest = exports.HttpRequest = function () {
    function HttpRequest(options) {
        _classCallCheck(this, HttpRequest);

        this.method = "";
        this.port = "";
        this.path = "";
        this.host = "";
        this.data = "";
        this.headers = {};

        var protocolJson = options.toJson();

        for (var prop in protocolJson) {
            this[prop] = protocolJson[prop];
        }
    }

    _createClass(HttpRequest, [{
        key: 'node_request',
        value: function node_request() {
            var _this = this;

            var promise = new Promise(function (resolve, reject) {
                var request = https.request({
                    method: _this.method,
                    port: _this.port,
                    path: _this.path,
                    host: _this.host,
                    headers: _this.headers
                }, function (res) {
                    var result = "";
                    if (res.statusCode !== 200) {
                        return reject({
                            error: true,
                            errCode: res.statusCode,
                            errMsg: res.responseText || 'Invalid statusCode'
                        });
                    }

                    res.on('data', function (data) {
                        result += data.toString();
                    });

                    res.on('error', function (err) {
                        return reject({
                            error: true,
                            errCode: res.statusCode,
                            errMsg: err.message
                        });
                    });

                    res.on('end', function () {
                        return resolve(result);
                    });
                });

                request.on('aborted', function () {
                    return reject({
                        error: true,
                        errCode: 504,
                        errMsg: 'Request has been aborted by the server'
                    });
                });

                request.on('abort', function () {
                    return reject({
                        error: true,
                        errCode: 418,
                        errMsg: 'Request has been aborted by the client'
                    });
                });

                request.on('error', function (err) {
                    return reject({
                        error: true,
                        errCode: 422,
                        errMsg: err.message
                    });
                });

                request.setTimeout(_this.timeout, function () {
                    request.abort();
                });

                request.write(_this.data);
                request.end();
            });
            return promise;
        }
    }, {
        key: 'ajax',
        value: function ajax() {
            var _this2 = this;

            var promise = new Promise(function (resolve, reject) {
                var url = 'https://' + _this2.host + _this2.path;
                var xhr = new XMLHttpRequest();

                xhr.timeout = _this2.timeout;
                xhr.open(_this2.method, url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) return;
                    if (xhr.status != 200) {
                        return reject(new Error('Invalid statusCode: ' + xhr.status));
                    } else {
                        resolve(xhr.responseText);
                    }
                };
                xhr.send(_this2.data);
            });

            return promise;
        }
    }, {
        key: 'request',
        value: function request() {
            if (typeof XMLHttpRequest !== 'undefined') {
                return this.ajax();
            }
            return this.node_request();
        }
    }, {
        key: 'execute',
        value: function execute() {
            return this.request().then(function (data) {
                return JSON.parse(data);
            }).then(function (res) {
                if (res.error) {
                    return Promise.reject(res);
                }

                return Promise.resolve(JSON.stringify(res));
            }).catch(function (err) {
                (0, _observer2.default)().emit('error', err);
                return Promise.reject(err);
            });
        }
    }]);

    return HttpRequest;
}();

},{"./observer":39,"https":undefined}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCInstance = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _httpRequest = require('./httpRequest');

var _protocol = require('./protocol');

var _client = require('./client');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCInstance = exports.SCInstance = function () {
    function SCInstance(data) {
        _classCallCheck(this, SCInstance);

        this._extend(data);
    }

    _createClass(SCInstance, [{
        key: '_extend',
        value: function _extend(data) {
            for (var it in data) {
                this[it] = data[it];
            }
        }
    }, {
        key: 'save',
        value: function save() {
            var _this = this;

            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {};

            if (this.id) {
                protocolOpts.url = _client.SDKOptions.CREATE_INSTANCE_URL;
            } else {
                protocolOpts.url = _client.SDKOptions.UPDATE_INSTANCE_URL;
            }

            var protocol = _protocol.Protocol.init(protocolOpts);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                _this._extend(response.result);
                return _this;
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'remove',
        value: function remove() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.REMOVE_INSTANCE_URL
            };
            var protocol = _protocol.Protocol.init(protocolOpts);
            protocol.setData({
                id: this.id
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return response.result;
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'run',
        value: function run() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.RUN_INSTANCE_URL
            };
            var protocol = _protocol.Protocol.init(protocolOpts);
            protocol.setData({
                id: this.id
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'stop',
        value: function stop() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.STOP_INSTANCE_URL
            };
            var protocol = _protocol.Protocol.init(protocolOpts);
            protocol.setData({
                id: this.id
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'runScript',
        value: function runScript(path) {
            var pool = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var callbacks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var protocolOpts = {
                url: _client.SDKOptions.RUN_SCRIPT_INSTANCE_URL
            };
            var protocol = _protocol.Protocol.init(protocolOpts);
            protocol.setData({
                id: this.id,
                path: path,
                pool: pool
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'killScript',
        value: function killScript(pid) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocolOpts = {
                url: _client.SDKOptions.KILL_SCRIPT_INSTANCE_URL
            };
            var protocol = _protocol.Protocol.init(protocolOpts);
            protocol.setData({
                id: this.id,
                pid: pid
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getScripts',
        value: function getScripts() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.SCRIPTS_INSTANCE_URL
            };
            var protocol = _protocol.Protocol.init(protocolOpts);
            protocol.setData({
                id: this.id
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }]);

    return SCInstance;
}();

},{"./client":30,"./httpRequest":32,"./protocol":40,"./utils":48}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCLogger = exports.SCLogger = function SCLogger() {
    var opt = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SCLogger);

    this.log = function () {
        console.log.apply(this, arguments);
    };
    this.error = function () {
        console.error.apply(this, arguments);
    };
};

},{}],35:[function(require,module,exports){
'use strict';

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright 2009 Google Inc. All Rights Reserved

/**
 * Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "Long". This
 * implementation is derived from LongLib in GWT.
 *
 * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
 * values as *signed* integers.  See the from* functions below for more
 * convenient ways of constructing Longs.
 *
 * The internal representation of a Long is the two given signed, 32-bit values.
 * We use 32-bit pieces because these are the size of integers on which
 * Javascript performs bit-operations.  For operations like addition and
 * multiplication, we split each number into 16-bit pieces, which can easily be
 * multiplied within Javascript's floating-point representation without overflow
 * or change in sign.
 *
 * In the algorithms below, we frequently reduce the negative case to the
 * positive case by negating the input(s) and then post-processing the result.
 * Note that we must ALWAYS check specially whether those values are MIN_VALUE
 * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
 * a positive number, it overflows back into a negative).  Not handling this
 * case would often result in infinite recursion.
 *
 * @class
 * @param {number} low  the low (signed) 32 bits of the Long.
 * @param {number} high the high (signed) 32 bits of the Long.
 * @return {Long}
 */
function Long(low, high) {
    if (!(this instanceof Long)) return new Long(low, high);

    this._bsontype = 'Long';
    /**
     * @type {number}
     * @ignore
     */
    this.low_ = low | 0; // force into 32 signed bits.

    /**
     * @type {number}
     * @ignore
     */
    this.high_ = high | 0; // force into 32 signed bits.
};

/**
 * Return the int value.
 *
 * @method
 * @return {number} the value, assuming it is a 32-bit integer.
 */
Long.prototype.toInt = function () {
    return this.low_;
};

/**
 * Return the Number value.
 *
 * @method
 * @return {number} the closest floating-point representation to this value.
 */
Long.prototype.toNumber = function () {
    return this.high_ * Long.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned();
};

/**
 * Return the JSON value.
 *
 * @method
 * @return {string} the JSON representation.
 */
Long.prototype.toJSON = function () {
    return this.toString();
};

/**
 * Return the String value.
 *
 * @method
 * @param {number} [opt_radix] the radix in which the text should be written.
 * @return {string} the textual representation of this value.
 */
Long.prototype.toString = function (opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
        throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
        return '0';
    }

    if (this.isNegative()) {
        if (this.equals(Long.MIN_VALUE)) {
            // We need to change the Long value before it can be negated, so we remove
            // the bottom-most digit in this base and then recurse to do the rest.
            var radixLong = Long.fromNumber(radix);
            var div = this.div(radixLong);
            var rem = div.multiply(radixLong).subtract(this);
            return div.toString(radix) + rem.toInt().toString(radix);
        } else {
            return '-' + this.negate().toString(radix);
        }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
        var remDiv = rem.div(radixToPower);
        var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
        var digits = intval.toString(radix);

        rem = remDiv;
        if (rem.isZero()) {
            return digits + result;
        } else {
            while (digits.length < 6) {
                digits = '0' + digits;
            }
            result = '' + digits + result;
        }
    }
};

/**
 * Return the high 32-bits value.
 *
 * @method
 * @return {number} the high 32-bits as a signed value.
 */
Long.prototype.getHighBits = function () {
    return this.high_;
};

/**
 * Return the low 32-bits value.
 *
 * @method
 * @return {number} the low 32-bits as a signed value.
 */
Long.prototype.getLowBits = function () {
    return this.low_;
};

/**
 * Return the low unsigned 32-bits value.
 *
 * @method
 * @return {number} the low 32-bits as an unsigned value.
 */
Long.prototype.getLowBitsUnsigned = function () {
    return this.low_ >= 0 ? this.low_ : Long.TWO_PWR_32_DBL_ + this.low_;
};

/**
 * Returns the number of bits needed to represent the absolute value of this Long.
 *
 * @method
 * @return {number} Returns the number of bits needed to represent the absolute value of this Long.
 */
Long.prototype.getNumBitsAbs = function () {
    if (this.isNegative()) {
        if (this.equals(Long.MIN_VALUE)) {
            return 64;
        } else {
            return this.negate().getNumBitsAbs();
        }
    } else {
        var val = this.high_ != 0 ? this.high_ : this.low_;
        for (var bit = 31; bit > 0; bit--) {
            if ((val & 1 << bit) != 0) {
                break;
            }
        }
        return this.high_ != 0 ? bit + 33 : bit + 1;
    }
};

/**
 * Return whether this value is zero.
 *
 * @method
 * @return {boolean} whether this value is zero.
 */
Long.prototype.isZero = function () {
    return this.high_ == 0 && this.low_ == 0;
};

/**
 * Return whether this value is negative.
 *
 * @method
 * @return {boolean} whether this value is negative.
 */
Long.prototype.isNegative = function () {
    return this.high_ < 0;
};

/**
 * Return whether this value is odd.
 *
 * @method
 * @return {boolean} whether this value is odd.
 */
Long.prototype.isOdd = function () {
    return (this.low_ & 1) == 1;
};

/**
 * Return whether this Long equals the other
 *
 * @method
 * @param {Long} other Long to compare against.
 * @return {boolean} whether this Long equals the other
 */
Long.prototype.equals = function (other) {
    return this.high_ == other.high_ && this.low_ == other.low_;
};

/**
 * Return whether this Long does not equal the other.
 *
 * @method
 * @param {Long} other Long to compare against.
 * @return {boolean} whether this Long does not equal the other.
 */
Long.prototype.notEquals = function (other) {
    return this.high_ != other.high_ || this.low_ != other.low_;
};

/**
 * Return whether this Long is less than the other.
 *
 * @method
 * @param {Long} other Long to compare against.
 * @return {boolean} whether this Long is less than the other.
 */
Long.prototype.lessThan = function (other) {
    return this.compare(other) < 0;
};

/**
 * Return whether this Long is less than or equal to the other.
 *
 * @method
 * @param {Long} other Long to compare against.
 * @return {boolean} whether this Long is less than or equal to the other.
 */
Long.prototype.lessThanOrEqual = function (other) {
    return this.compare(other) <= 0;
};

/**
 * Return whether this Long is greater than the other.
 *
 * @method
 * @param {Long} other Long to compare against.
 * @return {boolean} whether this Long is greater than the other.
 */
Long.prototype.greaterThan = function (other) {
    return this.compare(other) > 0;
};

/**
 * Return whether this Long is greater than or equal to the other.
 *
 * @method
 * @param {Long} other Long to compare against.
 * @return {boolean} whether this Long is greater than or equal to the other.
 */
Long.prototype.greaterThanOrEqual = function (other) {
    return this.compare(other) >= 0;
};

/**
 * Compares this Long with the given one.
 *
 * @method
 * @param {Long} other Long to compare against.
 * @return {boolean} 0 if they are the same, 1 if the this is greater, and -1 if the given one is greater.
 */
Long.prototype.compare = function (other) {
    if (this.equals(other)) {
        return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
        return -1;
    }
    if (!thisNeg && otherNeg) {
        return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
        return -1;
    } else {
        return 1;
    }
};

/**
 * The negation of this value.
 *
 * @method
 * @return {Long} the negation of this value.
 */
Long.prototype.negate = function () {
    if (this.equals(Long.MIN_VALUE)) {
        return Long.MIN_VALUE;
    } else {
        return this.not().add(Long.ONE);
    }
};

/**
 * Returns the sum of this and the given Long.
 *
 * @method
 * @param {Long} other Long to add to this one.
 * @return {Long} the sum of this and the given Long.
 */
Long.prototype.add = function (other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32);
};

/**
 * Returns the difference of this and the given Long.
 *
 * @method
 * @param {Long} other Long to subtract from this.
 * @return {Long} the difference of this and the given Long.
 */
Long.prototype.subtract = function (other) {
    return this.add(other.negate());
};

/**
 * Returns the product of this and the given Long.
 *
 * @method
 * @param {Long} other Long to multiply with this.
 * @return {Long} the product of this and the other.
 */
Long.prototype.multiply = function (other) {
    if (this.isZero()) {
        return Long.ZERO;
    } else if (other.isZero()) {
        return Long.ZERO;
    }

    if (this.equals(Long.MIN_VALUE)) {
        return other.isOdd() ? Long.MIN_VALUE : Long.ZERO;
    } else if (other.equals(Long.MIN_VALUE)) {
        return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
    }

    if (this.isNegative()) {
        if (other.isNegative()) {
            return this.negate().multiply(other.negate());
        } else {
            return this.negate().multiply(other).negate();
        }
    } else if (other.isNegative()) {
        return this.multiply(other.negate()).negate();
    }

    // If both Longs are small, use float multiplication
    if (this.lessThan(Long.TWO_PWR_24_) && other.lessThan(Long.TWO_PWR_24_)) {
        return Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each Long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32);
};

/**
 * Returns this Long divided by the given one.
 *
 * @method
 * @param {Long} other Long by which to divide.
 * @return {Long} this Long divided by the given one.
 */
Long.prototype.div = function (other) {
    if (other.isZero()) {
        throw Error('division by zero');
    } else if (this.isZero()) {
        return Long.ZERO;
    }

    if (this.equals(Long.MIN_VALUE)) {
        if (other.equals(Long.ONE) || other.equals(Long.NEG_ONE)) {
            return Long.MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
        } else if (other.equals(Long.MIN_VALUE)) {
                return Long.ONE;
            } else {
                // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                var halfThis = this.shiftRight(1);
                var approx = halfThis.div(other).shiftLeft(1);
                if (approx.equals(Long.ZERO)) {
                    return other.isNegative() ? Long.ONE : Long.NEG_ONE;
                } else {
                    var rem = this.subtract(other.multiply(approx));
                    var result = approx.add(rem.div(other));
                    return result;
                }
            }
    } else if (other.equals(Long.MIN_VALUE)) {
        return Long.ZERO;
    }

    if (this.isNegative()) {
        if (other.isNegative()) {
            return this.negate().div(other.negate());
        } else {
            return this.negate().div(other).negate();
        }
    } else if (other.isNegative()) {
        return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
        // Approximate the result of division. This may be a little greater or
        // smaller than the actual value.
        var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

        // We will tweak the approximate result by changing it in the 48-th digit or
        // the smallest non-fractional digit, whichever is larger.
        var log2 = Math.ceil(Math.log(approx) / Math.LN2);
        var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);

        // Decrease the approximation until it is smaller than the remainder.  Note
        // that if it is too large, the product overflows and is negative.
        var approxRes = Long.fromNumber(approx);
        var approxRem = approxRes.multiply(other);
        while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
            approx -= delta;
            approxRes = Long.fromNumber(approx);
            approxRem = approxRes.multiply(other);
        }

        // We know the answer can't be zero... and actually, zero would cause
        // infinite recursion since we would make no progress.
        if (approxRes.isZero()) {
            approxRes = Long.ONE;
        }

        res = res.add(approxRes);
        rem = rem.subtract(approxRem);
    }
    return res;
};

/**
 * Returns this Long modulo the given one.
 *
 * @method
 * @param {Long} other Long by which to mod.
 * @return {Long} this Long modulo the given one.
 */
Long.prototype.modulo = function (other) {
    return this.subtract(this.div(other).multiply(other));
};

/**
 * The bitwise-NOT of this value.
 *
 * @method
 * @return {Long} the bitwise-NOT of this value.
 */
Long.prototype.not = function () {
    return Long.fromBits(~this.low_, ~this.high_);
};

/**
 * Returns the bitwise-AND of this Long and the given one.
 *
 * @method
 * @param {Long} other the Long with which to AND.
 * @return {Long} the bitwise-AND of this and the other.
 */
Long.prototype.and = function (other) {
    return Long.fromBits(this.low_ & other.low_, this.high_ & other.high_);
};

/**
 * Returns the bitwise-OR of this Long and the given one.
 *
 * @method
 * @param {Long} other the Long with which to OR.
 * @return {Long} the bitwise-OR of this and the other.
 */
Long.prototype.or = function (other) {
    return Long.fromBits(this.low_ | other.low_, this.high_ | other.high_);
};

/**
 * Returns the bitwise-XOR of this Long and the given one.
 *
 * @method
 * @param {Long} other the Long with which to XOR.
 * @return {Long} the bitwise-XOR of this and the other.
 */
Long.prototype.xor = function (other) {
    return Long.fromBits(this.low_ ^ other.low_, this.high_ ^ other.high_);
};

/**
 * Returns this Long with bits shifted to the left by the given amount.
 *
 * @method
 * @param {number} numBits the number of bits by which to shift.
 * @return {Long} this shifted to the left by the given amount.
 */
Long.prototype.shiftLeft = function (numBits) {
    numBits &= 63;
    if (numBits == 0) {
        return this;
    } else {
        var low = this.low_;
        if (numBits < 32) {
            var high = this.high_;
            return Long.fromBits(low << numBits, high << numBits | low >>> 32 - numBits);
        } else {
            return Long.fromBits(0, low << numBits - 32);
        }
    }
};

/**
 * Returns this Long with bits shifted to the right by the given amount.
 *
 * @method
 * @param {number} numBits the number of bits by which to shift.
 * @return {Long} this shifted to the right by the given amount.
 */
Long.prototype.shiftRight = function (numBits) {
    numBits &= 63;
    if (numBits == 0) {
        return this;
    } else {
        var high = this.high_;
        if (numBits < 32) {
            var low = this.low_;
            return Long.fromBits(low >>> numBits | high << 32 - numBits, high >> numBits);
        } else {
            return Long.fromBits(high >> numBits - 32, high >= 0 ? 0 : -1);
        }
    }
};

/**
 * Returns this Long with bits shifted to the right by the given amount, with the new top bits matching the current sign bit.
 *
 * @method
 * @param {number} numBits the number of bits by which to shift.
 * @return {Long} this shifted to the right by the given amount, with zeros placed into the new leading bits.
 */
Long.prototype.shiftRightUnsigned = function (numBits) {
    numBits &= 63;
    if (numBits == 0) {
        return this;
    } else {
        var high = this.high_;
        if (numBits < 32) {
            var low = this.low_;
            return Long.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits);
        } else if (numBits == 32) {
            return Long.fromBits(high, 0);
        } else {
            return Long.fromBits(high >>> numBits - 32, 0);
        }
    }
};

/**
 * Returns a Long representing the given (32-bit) integer value.
 *
 * @method
 * @param {number} value the 32-bit integer in question.
 * @return {Long} the corresponding Long value.
 */
Long.fromInt = function (value) {
    if (-128 <= value && value < 128) {
        var cachedObj = Long.INT_CACHE_[value];
        if (cachedObj) {
            return cachedObj;
        }
    }

    var obj = new Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
        Long.INT_CACHE_[value] = obj;
    }
    return obj;
};

/**
 * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
 *
 * @method
 * @param {number} value the number in question.
 * @return {Long} the corresponding Long value.
 */
Long.fromNumber = function (value) {
    if (isNaN(value) || !isFinite(value)) {
        return Long.ZERO;
    } else if (value <= -Long.TWO_PWR_63_DBL_) {
        return Long.MIN_VALUE;
    } else if (value + 1 >= Long.TWO_PWR_63_DBL_) {
        return Long.MAX_VALUE;
    } else if (value < 0) {
        return Long.fromNumber(-value).negate();
    } else {
        return new Long(value % Long.TWO_PWR_32_DBL_ | 0, value / Long.TWO_PWR_32_DBL_ | 0);
    }
};

/**
 * Returns a Long representing the 64-bit integer that comes by concatenating the given high and low bits. Each is assumed to use 32 bits.
 *
 * @method
 * @param {number} lowBits the low 32-bits.
 * @param {number} highBits the high 32-bits.
 * @return {Long} the corresponding Long value.
 */
Long.fromBits = function (lowBits, highBits) {
    return new Long(lowBits, highBits);
};

/**
 * Returns a Long representation of the given string, written using the given radix.
 *
 * @method
 * @param {string} str the textual representation of the Long.
 * @param {number} opt_radix the radix in which the text is written.
 * @return {Long} the corresponding Long value.
 */
Long.fromString = function (str, opt_radix) {
    if (str.length == 0) {
        throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
        throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
        return Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
        throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = Long.fromNumber(Math.pow(radix, 8));

    var result = Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i);
        var value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
            var power = Long.fromNumber(Math.pow(radix, size));
            result = result.multiply(power).add(Long.fromNumber(value));
        } else {
            result = result.multiply(radixToPower);
            result = result.add(Long.fromNumber(value));
        }
    }
    return result;
};

// NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
// from* methods on which they depend.

/**
 * A cache of the Long representations of small integer values.
 * @type {Object}
 * @ignore
 */
Long.INT_CACHE_ = {};

// NOTE: the compiler should inline these constant values below and then remove
// these variables, so there should be no runtime penalty for these.

/**
 * Number used repeated below in calculations.  This must appear before the
 * first call to any from* function below.
 * @type {number}
 * @ignore
 */
Long.TWO_PWR_16_DBL_ = 1 << 16;

/**
 * @type {number}
 * @ignore
 */
Long.TWO_PWR_24_DBL_ = 1 << 24;

/**
 * @type {number}
 * @ignore
 */
Long.TWO_PWR_32_DBL_ = Long.TWO_PWR_16_DBL_ * Long.TWO_PWR_16_DBL_;

/**
 * @type {number}
 * @ignore
 */
Long.TWO_PWR_31_DBL_ = Long.TWO_PWR_32_DBL_ / 2;

/**
 * @type {number}
 * @ignore
 */
Long.TWO_PWR_48_DBL_ = Long.TWO_PWR_32_DBL_ * Long.TWO_PWR_16_DBL_;

/**
 * @type {number}
 * @ignore
 */
Long.TWO_PWR_64_DBL_ = Long.TWO_PWR_32_DBL_ * Long.TWO_PWR_32_DBL_;

/**
 * @type {number}
 * @ignore
 */
Long.TWO_PWR_63_DBL_ = Long.TWO_PWR_64_DBL_ / 2;

/** @type {Long} */
Long.ZERO = Long.fromInt(0);

/** @type {Long} */
Long.ONE = Long.fromInt(1);

/** @type {Long} */
Long.NEG_ONE = Long.fromInt(-1);

/** @type {Long} */
Long.MAX_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);

/** @type {Long} */
Long.MIN_VALUE = Long.fromBits(0, 0x80000000 | 0);

/**
 * @type {Long}
 * @ignore
 */
Long.TWO_PWR_24_ = Long.fromInt(1 << 24);

/**
 * Expose.
 */
module.exports = Long;
module.exports.Long = Long;

},{}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCMessenger = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _query = require('./query');

var _protocol = require('./protocol');

var _utils = require('./utils');

var _httpRequest = require('./httpRequest');

var _client = require('./client');

var _websocket = require('./websocket');

var _logger = require('./logger');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCMessenger = exports.SCMessenger = function () {
    function SCMessenger() {
        var _this = this;

        var opt = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, SCMessenger);

        if (opt.logger instanceof _logger.SCLogger) {
            this.logger = opt.logger;
            this._ws = new _websocket.SCWebSocket("messenger_debugger");
            this._ws.on("open", function () {
                _this.logger.log('Debugger is active');
            });
            this._ws.on("error", function (err) {
                _this.logger.error(err);
            });
            this._ws.on("message", function (msg) {
                _this.logger.log(msg);
            });
        }
    }

    _createClass(SCMessenger, [{
        key: 'sendPush',
        value: function sendPush(options, debug) {
            var callbacks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
                throw new Error('Invalid options type');
            }

            if (!(options.where instanceof _query.SCQuery)) {
                throw new Error('Where must be a type of Query');
            }

            if (_typeof(options.data) !== 'object') {
                throw new Error('Invalid data type');
            }

            if ((typeof debug === 'undefined' ? 'undefined' : _typeof(debug)) === 'object') {
                callbacks = debug;
            }

            var protocolOpts = {
                url: _client.SDKOptions.SEND_PUSH_URL
            };

            var data = {
                msg: options.data,
                debug: debug
            };

            _utils.Utils.extend(data, options.where.toJson());

            var protocol = _protocol.MessengerProtocol.init(data, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'sendSms',
        value: function sendSms(options, debug) {
            var callbacks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
                throw new Error('Invalid options type');
            }

            if (!(options.where instanceof _query.SCQuery)) {
                throw new Error('Where must be a type of Query');
            }

            if (_typeof(options.data) !== 'object') {
                throw new Error('Invalid data type');
            }

            if (typeof options.data.text !== 'string') {
                throw new Error('Missing subject or text message');
            }

            if ((typeof debug === 'undefined' ? 'undefined' : _typeof(debug)) === 'object') {
                callbacks = debug;
            }

            var protocolOpts = {
                url: _client.SDKOptions.SEND_SMS_URL
            };

            var data = {
                msg: options.data,
                debug: debug
            };

            _utils.Utils.extend(data, options.where.toJson());

            var protocol = _protocol.MessengerProtocol.init(data, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }]);

    return SCMessenger;
}();

},{"./client":30,"./httpRequest":32,"./logger":34,"./protocol":40,"./query":41,"./utils":48,"./websocket":49}],37:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCObject = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _query = require("./query");

var _utils = require("./utils");

var _updateOps = require("./updateOps");

var _data = require("./stores/data");

var _client = require("./client");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCObject = exports.SCObject = function () {
    function SCObject(collName, model) {
        _classCallCheck(this, SCObject);

        if (typeof collName !== 'string') {
            throw new Error('Invalid collection name');
        }

        this.collection = collName;
        this.attrs = Object.assign({}, model);
        this.update = {};

        for (var prop in _updateOps.operators) {
            this[prop] = _updateOps.operators[prop];
        }
    }

    _createClass(SCObject, [{
        key: "setAttrs",
        value: function setAttrs(obj) {
            var model = Object.assign({}, obj);
            for (var item in model) {
                this.set(item, model[item]);
            }
        }
    }, {
        key: "getAttrs",
        value: function getAttrs() {
            return Object.assign({}, this.attrs);
        }
    }, {
        key: "getById",
        value: function getById(id, options) {
            var _this = this;

            var query = new _query.SCQuery(this.collection);

            if (!id) {
                throw new Error('Id is empty');
            }

            var promise = query.equalTo('_id', id).find(options).then(function (data) {
                if (!data.result.length) {
                    throw new Error('Document not found');
                }

                _this.attrs = {};
                _utils.Utils.extend(_this.attrs, data.result[0]);

                return data.result[0];
            });

            return promise;
        }
    }, {
        key: "get",
        value: function get(key) {
            return this.attrs[key];
        }
    }, {
        key: "getFileLink",
        value: function getFileLink(field) {
            if (!this.attrs['_id']) {
                throw new Error('You must first create a document and upload file');
            }

            if (!this.attrs.hasOwnProperty(field)) {
                throw new Error('Unknown field');
            }

            if (!this.attrs[field]) {
                throw new Error('Field is empty');
            }

            var client = _client.Client.getInstance();
            return 'https://api.scorocode.ru/api/v1/getfile/' + client.applicationID + '/' + this.collection + '/' + field + '/' + this.attrs._id + '/' + this.attrs[field];
        }
    }, {
        key: "removeFile",
        value: function removeFile(field) {
            var _this2 = this;

            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if (!this.attrs['_id']) {
                throw new Error('You must first create a document and upload file');
            }

            if (!this.attrs.hasOwnProperty(field)) {
                throw new Error('Unknown field');
            }

            if (!this.attrs[field]) {
                throw new Error('Field is empty');
            }

            var QueryJSON = this.toJson();
            var params = {
                coll: QueryJSON.coll,
                docId: this.attrs['_id'],
                field: field,
                file: this.attrs[field]
            };
            return _data.DataStore.getInstance().removeFile(params, options).then(function (data) {
                if (!data.error) {
                    _this2.attrs[field] = '';
                }
                return data;
            });
        }
    }, {
        key: "uploadFile",
        value: function uploadFile(field, filename, file) {
            var _this3 = this;

            var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

            if (!this.attrs['_id']) {
                throw new Error('You must first create a document');
            }

            var base64 = file.split(',');
            var base64result = "";

            if (base64.length == 2) {
                base64result = base64[1];
            } else {
                base64result = base64[0];
            }

            var QueryJSON = this.toJson();

            var params = {
                coll: QueryJSON.coll,
                docId: this.attrs['_id'],
                field: field,
                file: filename,
                content: base64result
            };
            return _data.DataStore.getInstance().uploadFile(params, options).then(function (data) {

                if (!data.error) {
                    _this3.attrs[field] = data.result;
                }
                return data;
            });
        }
    }, {
        key: "toJson",
        value: function toJson() {
            var json = {
                coll: this.collection,
                query: this.attrs['_id'] ? { _id: this.attrs['_id'] } : {},
                doc: this.attrs['_id'] ? this.update : this.attrs
            };
            return json;
        }
    }, {
        key: "save",
        value: function save() {
            var _this4 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (this.attrs['_id']) {
                return _data.DataStore.getInstance().updateById(this.toJson(), options).then(function (data) {
                    if (!data.error) {
                        _this4.attrs = data.result;
                    }
                    _this4.update = {};
                    return data.result;
                });
            }

            return _data.DataStore.getInstance().insert(this.toJson(), options).then(function (data) {
                if (!data.error) {
                    _this4.attrs = data.result;
                }
                return data.result;
            });
        }
    }, {
        key: "remove",
        value: function remove() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (!this.attrs['_id']) {
                throw new Error("Document does't exist");
            }
            var query = new _query.SCQuery(this.collection);
            return query.equalTo('_id', this.attrs._id).remove(options).then(function (data) {
                return data;
            });
        }
    }], [{
        key: "extend",
        value: function extend(collName, childObject) {
            var obj = new SCObject(collName);
            for (var prop in childObject) {
                obj.attrs[prop] = childObject[prop];
            }

            return obj;
        }
    }]);

    return SCObject;
}();

},{"./client":30,"./query":41,"./stores/data":43,"./updateOps":46,"./utils":48}],38:[function(require,module,exports){
(function (process,Buffer){
'use strict';

/**
 * Machine id.
 *
 * Create a random 3-byte value (i.e. unique for this
 * process). Other drivers use a md5 of the machine id here, but
 * that would mean an asyc call to gethostname, so we don't bother.
 * @ignore
 */
var MACHINE_ID = parseInt(Math.random() * 0xFFFFFF, 10);

// Regular expression that checks for hex value
var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
var hasBufferType = false;

// Check if buffer exists
try {
    if (Buffer && Buffer.from) hasBufferType = true;
} catch (err) {};

/**
 * Create a new ObjectID instance
 *
 * @class
 * @param {(string|number)} id Can be a 24 byte hex string, 12 byte binary string or a Number.
 * @property {number} generationTime The generation time of this ObjectId instance
 * @return {ObjectID} instance of ObjectID.
 */
var ObjectID = function ObjectID(id) {
    // Duck-typing to support ObjectId from different npm packages
    if (id instanceof ObjectID) return id;
    if (!(this instanceof ObjectID)) return new ObjectID(id);

    this._bsontype = 'ObjectID';

    // The most common usecase (blank id, new objectId instance)
    if (id == null || typeof id == 'number') {
        // Generate a new id
        this.id = this.generate(id);
        // If we are caching the hex string
        if (ObjectID.cacheHexString) this.__id = this.toString('hex');
        // Return the object
        return;
    }

    // Check if the passed in id is valid
    var valid = ObjectID.isValid(id);

    // Throw an error if it's not a valid setup
    if (!valid && id != null) {
        throw new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
    } else if (valid && typeof id == 'string' && id.length == 24 && hasBufferType) {
        return new ObjectID(new Buffer(id, 'hex'));
    } else if (valid && typeof id == 'string' && id.length == 24) {
        return ObjectID.createFromHexString(id);
    } else if (id != null && id.length === 12) {
        // assume 12 byte string
        this.id = id;
    } else if (id != null && id.toHexString) {
        // Duck-typing to support ObjectId from different npm packages
        return id;
    } else {
        throw new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
    }

    if (ObjectID.cacheHexString) this.__id = this.toString('hex');
};

// Allow usage of ObjectId as well as ObjectID
var ObjectId = ObjectID;

// Precomputed hex table enables speedy hex string conversion
var hexTable = [];
for (var i = 0; i < 256; i++) {
    hexTable[i] = (i <= 15 ? '0' : '') + i.toString(16);
}

/**
 * Return the ObjectID id as a 24 byte hex string representation
 *
 * @method
 * @return {string} return the 24 byte hex string representation.
 */
ObjectID.prototype.toHexString = function () {
    if (ObjectID.cacheHexString && this.__id) return this.__id;

    var hexString = '';
    if (!this.id || !this.id.length) {
        throw new Error('invalid ObjectId, ObjectId.id must be either a string or a Buffer, but is [' + JSON.stringify(this.id) + ']');
    }

    if (this.id instanceof _Buffer) {
        hexString = convertToHex(this.id);
        if (ObjectID.cacheHexString) this.__id = hexString;
        return hexString;
    }

    for (var i = 0; i < this.id.length; i++) {
        hexString += hexTable[this.id.charCodeAt(i)];
    }

    if (ObjectID.cacheHexString) this.__id = hexString;
    return hexString;
};

/**
 * Update the ObjectID index used in generating new ObjectID's on the driver
 *
 * @method
 * @return {number} returns next index value.
 * @ignore
 */
ObjectID.prototype.get_inc = function () {
    return ObjectID.index = (ObjectID.index + 1) % 0xFFFFFF;
};

/**
 * Update the ObjectID index used in generating new ObjectID's on the driver
 *
 * @method
 * @return {number} returns next index value.
 * @ignore
 */
ObjectID.prototype.getInc = function () {
    return this.get_inc();
};

/**
 * Generate a 12 byte id buffer used in ObjectID's
 *
 * @method
 * @param {number} [time] optional parameter allowing to pass in a second based timestamp.
 * @return {Buffer} return the 12 byte id buffer string.
 */
ObjectID.prototype.generate = function (time) {
    if ('number' != typeof time) {
        time = ~ ~(Date.now() / 1000);
    }

    // Use pid
    var pid = (typeof process === 'undefined' ? Math.floor(Math.random() * 100000) : process.pid) % 0xFFFF;
    var inc = this.get_inc();
    // Buffer used
    var buffer = new Buffer(12);
    // Encode time
    buffer[3] = time & 0xff;
    buffer[2] = time >> 8 & 0xff;
    buffer[1] = time >> 16 & 0xff;
    buffer[0] = time >> 24 & 0xff;
    // Encode machine
    buffer[6] = MACHINE_ID & 0xff;
    buffer[5] = MACHINE_ID >> 8 & 0xff;
    buffer[4] = MACHINE_ID >> 16 & 0xff;
    // Encode pid
    buffer[8] = pid & 0xff;
    buffer[7] = pid >> 8 & 0xff;
    // Encode index
    buffer[11] = inc & 0xff;
    buffer[10] = inc >> 8 & 0xff;
    buffer[9] = inc >> 16 & 0xff;
    // Return the buffer
    return buffer;
};

/**
 * Converts the id into a 24 byte hex string for printing
 *
 * @param {String} format The Buffer toString format parameter.
 * @return {String} return the 24 byte hex string representation.
 * @ignore
 */
ObjectID.prototype.toString = function (format) {
    // Is the id a buffer then use the buffer toString method to return the format
    if (this.id && this.id.copy) {
        return this.id.toString(typeof format === 'string' ? format : 'hex');
    }

    // if(this.buffer )
    return this.toHexString();
};

/**
 * Converts to a string representation of this Id.
 *
 * @return {String} return the 24 byte hex string representation.
 * @ignore
 */
ObjectID.prototype.inspect = ObjectID.prototype.toString;

/**
 * Converts to its JSON representation.
 *
 * @return {String} return the 24 byte hex string representation.
 * @ignore
 */
ObjectID.prototype.toJSON = function () {
    return this.toHexString();
};

/**
 * Compares the equality of this ObjectID with `otherID`.
 *
 * @method
 * @param {object} otherID ObjectID instance to compare against.
 * @return {boolean} the result of comparing two ObjectID's
 */
ObjectID.prototype.equals = function equals(otherId) {
    var id;

    if (otherId instanceof ObjectID) {
        return this.toString() == otherId.toString();
    } else if (typeof otherId == 'string' && ObjectID.isValid(otherId) && otherId.length == 12 && this.id instanceof _Buffer) {
        return otherId === this.id.toString('binary');
    } else if (typeof otherId == 'string' && ObjectID.isValid(otherId) && otherId.length == 24) {
        return otherId.toLowerCase() === this.toHexString();
    } else if (typeof otherId == 'string' && ObjectID.isValid(otherId) && otherId.length == 12) {
        return otherId === this.id;
    } else if (otherId != null && (otherId instanceof ObjectID || otherId.toHexString)) {
        return otherId.toHexString() === this.toHexString();
    } else {
        return false;
    }
};

/**
 * Returns the generation date (accurate up to the second) that this ID was generated.
 *
 * @method
 * @return {date} the generation date
 */
ObjectID.prototype.getTimestamp = function () {
    var timestamp = new Date();
    var time = this.id[3] | this.id[2] << 8 | this.id[1] << 16 | this.id[0] << 24;
    timestamp.setTime(Math.floor(time) * 1000);
    return timestamp;
};

/**
 * @ignore
 */
ObjectID.index = ~ ~(Math.random() * 0xFFFFFF);

/**
 * @ignore
 */
ObjectID.createPk = function createPk() {
    return new ObjectID();
};

/**
 * Creates an ObjectID from a second based number, with the rest of the ObjectID zeroed out. Used for comparisons or sorting the ObjectID.
 *
 * @method
 * @param {number} time an integer number representing a number of seconds.
 * @return {ObjectID} return the created ObjectID
 */
ObjectID.createFromTime = function createFromTime(time) {
    var buffer = new Buffer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    // Encode time into first 4 bytes
    buffer[3] = time & 0xff;
    buffer[2] = time >> 8 & 0xff;
    buffer[1] = time >> 16 & 0xff;
    buffer[0] = time >> 24 & 0xff;
    // Return the new objectId
    return new ObjectID(buffer);
};

// Lookup tables
var encodeLookup = '0123456789abcdef'.split('');
var decodeLookup = [];
var i = 0;
while (i < 10) {
    decodeLookup[0x30 + i] = i++;
}while (i < 16) {
    decodeLookup[0x41 - 10 + i] = decodeLookup[0x61 - 10 + i] = i++;
}var _Buffer = Buffer;
var convertToHex = function convertToHex(bytes) {
    return bytes.toString('hex');
};

/**
 * Creates an ObjectID from a hex string representation of an ObjectID.
 *
 * @method
 * @param {string} hexString create a ObjectID from a passed in 24 byte hexstring.
 * @return {ObjectID} return the created ObjectID
 */
ObjectID.createFromHexString = function createFromHexString(string) {
    // Throw an error if it's not a valid setup
    if (typeof string === 'undefined' || string != null && string.length != 24) {
        throw new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
    }

    // Use Buffer.from method if available
    if (hasBufferType) return new ObjectID(new Buffer(string, 'hex'));

    // Calculate lengths
    var array = new _Buffer(12);
    var n = 0;
    var i = 0;

    while (i < 24) {
        array[n++] = decodeLookup[string.charCodeAt(i++)] << 4 | decodeLookup[string.charCodeAt(i++)];
    }

    return new ObjectID(array);
};

/**
 * Checks if a value is a valid bson ObjectId
 *
 * @method
 * @return {boolean} return true if the value is a valid bson ObjectId, return false otherwise.
 */
ObjectID.isValid = function isValid(id) {
    if (id == null) return false;

    if (typeof id == 'number') {
        return true;
    }

    if (typeof id == 'string') {
        return id.length == 12 || id.length == 24 && checkForHexRegExp.test(id);
    }

    if (id instanceof ObjectID) {
        return true;
    }

    if (id instanceof _Buffer) {
        return true;
    }

    // Duck-Typing detection of ObjectId like objects
    if (id.toHexString) {
        return id.id.length == 12 || id.id.length == 24 && checkForHexRegExp.test(id.id);
    }

    return false;
};

/**
 * @ignore
 */
Object.defineProperty(ObjectID.prototype, "generationTime", {
    enumerable: true,
    get: function get() {
        return this.id[3] | this.id[2] << 8 | this.id[1] << 16 | this.id[0] << 24;
    },
    set: function set(value) {
        // Encode time into first 4 bytes
        this.id[3] = value & 0xff;
        this.id[2] = value >> 8 & 0xff;
        this.id[1] = value >> 16 & 0xff;
        this.id[0] = value >> 24 & 0xff;
    }
});

/**
 * Expose.
 */
module.exports = ObjectID;
module.exports.ObjectID = ObjectID;
module.exports.ObjectId = ObjectID;

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":3,"buffer":4}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var instance;

function Observer() {

    if (instance) {
        return instance;
    }

    if (this && this.constructor === Observer) {
        instance = this;
    } else {
        return new Observer();
    }
}

Observer.prototype._listeners = {};

Observer.prototype.emit = function () {

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
    }

    var e = args.shift();

    if (!this._listeners[e]) {
        return false;
    }

    var ln = this._listeners[e].length;
    for (var _i = 0; _i < ln; _i++) {
        this._listeners[e][_i].apply(null, args);
    }
};

Observer.prototype.on = function (e, cb) {

    if (!this._listeners[e]) {
        this._listeners[e] = [];
    }
    this._listeners[e].push(cb);
};

var SCObserver = function () {

    return Observer;
}();

exports.default = SCObserver;

},{}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CloudFileProtocol = exports.BotProtocol = exports.CloudCodeProtocol = exports.MessengerProtocol = exports.UserProtocol = exports.DataProtocol = exports.Protocol = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _client = require('./client');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Protocol = exports.Protocol = function () {
    function Protocol(client, opts) {
        _classCallCheck(this, Protocol);

        this.method = 'POST';
        this.host = client.get('HOST');
        this.port = client.get('PORT');
        this.path = opts.url;
        this.data = {
            app: client.applicationID,
            cli: client.clientKey,
            acc: client.masterKey,
            sess: client.sessionId
        };
        this.headers = {
            'Content-Type': 'application/json'
        };
        this.timeout = opts.timeout || client.get('TIMEOUT');
    }

    _createClass(Protocol, [{
        key: 'setAccessKey',
        value: function setAccessKey(key, value) {
            this.data[key] = value;
            return this;
        }
    }, {
        key: 'setData',
        value: function setData(data) {
            for (var prop in data) {
                Object.defineProperty(this.data, prop, {
                    value: data[prop],
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
            }

            return this;
        }
    }, {
        key: 'setDoc',
        value: function setDoc(doc) {
            if (doc) {
                this.data.doc = doc;
            }

            return this;
        }
    }, {
        key: 'setIndex',
        value: function setIndex(index) {
            this.data.index = index;
        }
    }, {
        key: 'setField',
        value: function setField(field) {
            this.data.collField = field;
        }
    }, {
        key: 'setPath',
        value: function setPath(path) {
            this.data.path = path;
        }
    }, {
        key: 'setTriggers',
        value: function setTriggers(triggers) {
            this.data.triggers = triggers;
        }
    }, {
        key: 'setColl',
        value: function setColl(coll) {
            this.data.coll = coll;

            return this;
        }
    }, {
        key: 'setCollection',
        value: function setCollection(coll) {
            this.data.collection = coll;

            return this;
        }
    }, {
        key: 'toJson',
        value: function toJson() {
            var Json = {};

            for (var prop in this) {
                if (prop === 'data') {
                    Json[prop] = JSON.stringify(this[prop]);
                    continue;
                }
                Json[prop] = this[prop];
            }

            return Json;
        }
    }], [{
        key: 'init',
        value: function init(opts) {
            var client = _client.Client.getInstance();
            var protocol = new Protocol(client, opts);

            return protocol;
        }
    }]);

    return Protocol;
}();

var DataProtocol = exports.DataProtocol = function (_Protocol) {
    _inherits(DataProtocol, _Protocol);

    function DataProtocol(client, opts) {
        _classCallCheck(this, DataProtocol);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(DataProtocol).call(this, client, opts));
    }

    _createClass(DataProtocol, null, [{
        key: 'init',
        value: function init() {
            var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var doc = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var opts = arguments[2];

            var client = _client.Client.getInstance();
            var protocol = new DataProtocol(client, opts);
            protocol.setData(query);
            protocol.setDoc(doc);

            return protocol;
        }
    }]);

    return DataProtocol;
}(Protocol);

var UserProtocol = exports.UserProtocol = function (_Protocol2) {
    _inherits(UserProtocol, _Protocol2);

    function UserProtocol(client, opts) {
        _classCallCheck(this, UserProtocol);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(UserProtocol).call(this, client, opts));
    }

    _createClass(UserProtocol, null, [{
        key: 'init',
        value: function init(data, doc, opts) {
            var client = _client.Client.getInstance();
            var protocol = new UserProtocol(client, opts);
            protocol.setData(data);
            protocol.setDoc(doc);

            return protocol;
        }
    }]);

    return UserProtocol;
}(Protocol);

var MessengerProtocol = exports.MessengerProtocol = function (_Protocol3) {
    _inherits(MessengerProtocol, _Protocol3);

    function MessengerProtocol(client, options) {
        _classCallCheck(this, MessengerProtocol);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(MessengerProtocol).call(this, client, options));
    }

    _createClass(MessengerProtocol, null, [{
        key: 'init',
        value: function init(data, options) {
            var client = _client.Client.getInstance();
            var protocol = new MessengerProtocol(client, options);
            protocol.setData(data);
            protocol.setAccessKey('acc', client.masterKey || client.messageKey);
            return protocol;
        }
    }]);

    return MessengerProtocol;
}(Protocol);

var CloudCodeProtocol = exports.CloudCodeProtocol = function (_Protocol4) {
    _inherits(CloudCodeProtocol, _Protocol4);

    function CloudCodeProtocol(client, options) {
        _classCallCheck(this, CloudCodeProtocol);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CloudCodeProtocol).call(this, client, options));
    }

    _createClass(CloudCodeProtocol, null, [{
        key: 'init',
        value: function init(data, options) {
            var client = _client.Client.getInstance();
            var protocol = new CloudCodeProtocol(client, options);
            protocol.setData(data);
            protocol.setAccessKey('acc', client.masterKey || client.scriptKey);
            return protocol;
        }
    }]);

    return CloudCodeProtocol;
}(Protocol);

var BotProtocol = exports.BotProtocol = function () {
    function BotProtocol(botId, client, opts) {
        _classCallCheck(this, BotProtocol);

        this.method = 'POST';
        this.host = client.get('BOT_HOST');
        this.port = client.get('PORT');
        this.path = client.get('BOT_URL') + botId + '/response';
        this.data = {};
        this.headers = {
            'Content-Type': 'application/json'
        };
        this.timeout = opts.timeout || client.get('TIMEOUT');
    }

    _createClass(BotProtocol, [{
        key: 'setData',
        value: function setData(data) {
            for (var prop in data) {
                Object.defineProperty(this.data, prop, {
                    value: data[prop],
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
            }
        }
    }, {
        key: 'toJson',
        value: function toJson() {
            var Json = {};

            for (var prop in this) {
                if (prop === 'data') {
                    Json[prop] = JSON.stringify(this[prop]);
                    continue;
                }
                Json[prop] = this[prop];
            }

            return Json;
        }
    }], [{
        key: 'init',
        value: function init(botId) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var client = _client.Client.getInstance();
            var protocol = new BotProtocol(botId, client, options);

            return protocol;
        }
    }]);

    return BotProtocol;
}();

var CloudFileProtocol = exports.CloudFileProtocol = function (_Protocol5) {
    _inherits(CloudFileProtocol, _Protocol5);

    function CloudFileProtocol() {
        _classCallCheck(this, CloudFileProtocol);

        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(CloudFileProtocol).call(this));

        _this5.docId = "";
        _this5.field = "";
        return _this5;
    }

    return CloudFileProtocol;
}(Protocol);

},{"./client":30}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCQuery = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("./utils");

var _data = require("./stores/data");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCQuery = function () {
    function SCQuery(collName) {
        _classCallCheck(this, SCQuery);

        if (typeof collName !== 'string') {
            throw new Error('Collection name must be a type of string');
        }
        this._collection = collName;
        this._fields = [];
        this._filter = {};
        this._sort = {};
        this._limit = 100;
        this._skip = 0;
    }

    _createClass(SCQuery, [{
        key: "_addFilter",
        value: function _addFilter(field, condition, values) {
            if (!_utils.Utils.isObject(this._filter[field])) {
                this._filter[field] = {};
            }

            if ((typeof condition === "undefined" ? "undefined" : _typeof(condition)) === 'object') {
                this._filter[field] = condition;
                return this;
            }

            this._filter[field][condition] = values;
            return this;
        }
    }, {
        key: "find",
        value: function find() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            //TODO: Следует возвращать массив SC.Object вместо сырых данных
            return _data.DataStore.getInstance().find(this.toJson(), options);
        }

        // Не следует использовать для больших коллекций

    }, {
        key: "findAll",
        value: function findAll() {
            var _this = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var result = [];
            return _utils.Utils.promiseWhile(function (res) {
                if (!res) {
                    return true;
                }

                if (!res.result.length) {
                    return false;
                }

                result = result.concat(res.result);
                _this.skip(_this._skip + _this._limit);

                return true;
            }, function () {
                return _data.DataStore.getInstance().find(_this.toJson(), options);
            }).then(function (res) {
                return result;
            });
        }
    }, {
        key: "count",
        value: function count() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return _data.DataStore.getInstance().count(this.toJson(), options);
        }
    }, {
        key: "update",
        value: function update(object) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return _data.DataStore.getInstance().update(this.toJson(), object.toJson(), options);
        }
    }, {
        key: "remove",
        value: function remove() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return _data.DataStore.getInstance().remove(this.toJson(), options);
        }
    }, {
        key: "reset",
        value: function reset() {
            this._filter = {};
            this.fields = [];

            return this;
        }
    }, {
        key: "equalTo",
        value: function equalTo(field, value) {
            this._filter[field] = value;
            return this;
        }
    }, {
        key: "notEqualTo",
        value: function notEqualTo(field, value) {
            return this._addFilter(field, "$ne", value);
        }
    }, {
        key: "containedIn",
        value: function containedIn(field, value) {
            if (!_utils.Utils.isArray(value)) {
                throw new Error('Value must be of type: Array');
            }

            return this._addFilter(field, '$in', value);
        }
    }, {
        key: "containsAll",
        value: function containsAll(field, value) {
            if (!_utils.Utils.isArray(value)) {
                throw new Error('Value must be of type: Array');
            }

            return this._addFilter(field, '$all', value);
        }
    }, {
        key: "notContainedIn",
        value: function notContainedIn(field, value) {
            if (!_utils.Utils.isArray(value)) {
                throw new Error('Value must be of type: Array');
            }

            return this._addFilter(field, '$nin', value);
        }
    }, {
        key: "greaterThan",
        value: function greaterThan(field, value) {
            return this._addFilter(field, '$gt', value);
        }
    }, {
        key: "greaterThanOrEqualTo",
        value: function greaterThanOrEqualTo(field, value) {
            return this._addFilter(field, '$gte', value);
        }
    }, {
        key: "lessThan",
        value: function lessThan(field, value) {
            return this._addFilter(field, '$lt', value);
        }
    }, {
        key: "lessThanOrEqualTo",
        value: function lessThanOrEqualTo(field, value) {
            return this._addFilter(field, '$lte', value);
        }
    }, {
        key: "exists",
        value: function exists(field) {
            return this._addFilter(field, '$exists', true);
        }
    }, {
        key: "doesNotExist",
        value: function doesNotExist(field) {
            return this._addFilter(field, '$exists', false);
        }
    }, {
        key: "contains",
        value: function contains(field, value, opts) {
            if (opts) {
                return this._addFilter(field, { $regex: value, $options: opts });
            }

            return this._addFilter(field, '$regex', value);
        }
    }, {
        key: "startsWith",
        value: function startsWith(field, value, opts) {
            if (typeof value !== 'string') {
                throw new Error("Value must be a string");
            }

            if (opts) {
                return this._addFilter(field, { $regex: '^' + value, $options: opts });
            }

            return this._addFilter(field, '$regex', '^' + value);
        }
    }, {
        key: "endsWith",
        value: function endsWith(field, value, opts) {
            if (typeof value !== 'string') {
                throw new Error("Value must be a string");
            }

            if (opts) {
                return this._addFilter(field, { $regex: value + '$', $options: opts });
            }

            return this._addFilter(field, '$regex', value + '$');
        }
    }, {
        key: "limit",
        value: function limit(_limit) {
            if (!_utils.Utils.isNumber(_limit) || _limit < 0) {
                throw new Error("Limit must be a positive number");
            }

            this._limit = _limit;

            return this;
        }
    }, {
        key: "skip",
        value: function skip(_skip) {
            if (!_utils.Utils.isNumber(_skip) || _skip < 0) {
                throw new Error("Skip must be a positive number");
            }

            this._skip = _skip;

            return this;
        }
    }, {
        key: "page",
        value: function page(_page) {
            if (!_utils.Utils.isNumber(_page) || _page < 0) {
                throw new Error("Page must be a positive number");
            }

            this._skip = (_page - 1) * this._limit;

            return this;
        }
    }, {
        key: "ascending",
        value: function ascending(field) {
            this._sort[field] = 1;

            return this;
        }
    }, {
        key: "descending",
        value: function descending(field) {
            this._sort[field] = -1;

            return this;
        }
    }, {
        key: "or",
        value: function or(query) {
            if (!(query instanceof SCQuery)) {
                throw new Error('Invalid type of Query');
            }

            if (!this._filter['$or']) {
                this._filter['$or'] = [];
            }

            this._filter['$or'].push(query.toJson().query);

            return this;
        }
    }, {
        key: "and",
        value: function and(query) {
            if (!(query instanceof SCQuery)) {
                throw new Error('Invalid type of Query');
            }

            if (!this._filter['$and']) {
                this._filter['$and'] = [];
            }

            this._filter['$and'].push(query.toJson().query);

            return this;
        }
    }, {
        key: "select",
        value: function select() {
            this._fields = [];
            var ln = arguments.length;

            for (var i = 0; i < ln; i++) {
                this._fields.push(arguments[i]);
            }

            return this;
        }
    }, {
        key: "raw",
        value: function raw(filter) {
            if (!_utils.Utils.isObject(filter)) {
                throw new Error('Filter must be a object');
            }
            this._filter = filter;

            return this;
        }
    }, {
        key: "toJson",
        value: function toJson() {
            var json = {
                coll: this._collection,
                limit: this._limit,
                skip: this._skip,
                query: this._filter,
                sort: this._sort,
                fields: this._fields
            };

            return json;
        }
    }]);

    return SCQuery;
}();

exports.SCQuery = SCQuery;

},{"./stores/data":43,"./utils":48}],42:[function(require,module,exports){
'use strict';

var _query = require('./query');

var _user = require('./user');

var _object = require('./object');

var _client = require('./client');

var _updateOps = require('./updateOps');

var _messenger = require('./messenger');

var _cloudCode = require('./cloudCode');

var _websocket = require('./websocket');

var _system = require('./system');

var _logger = require('./logger');

var _bot = require('./bot');

var _instance = require('./instance');

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Scorocode = {
    Init: function Init(opt) {
        var client = _client.Client.init(opt);
        return client;
    },
    getSessionId: function getSessionId() {
        var client = _client.Client.getInstance();
        return client.sessionId;
    },
    setSessionId: function setSessionId(sessionId) {
        var client = _client.Client.getInstance();
        client.sessionId = sessionId;
    },
    on: function on(e, cb) {
        (0, _observer2.default)().on(e, cb);
    }
};

Scorocode.Query = _query.SCQuery;
Scorocode.Object = _object.SCObject;
Scorocode.User = _user.SCUser;
Scorocode.UpdateOps = _updateOps.SCUpdateOps;
Scorocode.Messenger = _messenger.SCMessenger;
Scorocode.CloudCode = _cloudCode.SCCloudCode;
Scorocode.WebSocket = _websocket.SCWebSocket;
Scorocode.System = _system.SCSystem;
Scorocode.Logger = _logger.SCLogger;
Scorocode.Bot = _bot.SCBot;
Scorocode.Instance = _instance.SCInstance;
Scorocode.Field = _system.SCField;

module.exports = Scorocode;

},{"./bot":28,"./client":30,"./cloudCode":31,"./instance":33,"./logger":34,"./messenger":36,"./object":37,"./observer":39,"./query":41,"./system":45,"./updateOps":46,"./user":47,"./websocket":49}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networkStore = require('./networkStore');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataStore = exports.DataStore = function () {
    function DataStore() {
        _classCallCheck(this, DataStore);
    }

    _createClass(DataStore, null, [{
        key: 'getInstance',
        value: function getInstance(type) {
            var store = void 0;
            switch (type) {
                default:
                    store = new _networkStore.Network();
            }
            return store;
        }
    }]);

    return DataStore;
}();

},{"./networkStore":44}],44:[function(require,module,exports){
(function (Buffer){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Network = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _protocol = require('../protocol');

var _httpRequest = require('../httpRequest');

var _utils = require('../utils');

var _bson = require('../bson');

var _client = require('../client');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Network = exports.Network = function () {
    function Network() {
        _classCallCheck(this, Network);
    }

    _createClass(Network, [{
        key: 'find',
        value: function find(query, options) {
            var protocolOpts = {
                url: _client.SDKOptions.FIND_URL
            };

            var protocol = _protocol.DataProtocol.init(query, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var base64Decoded = new Buffer(response.result, 'base64');
                var deserializedBson = (0, _bson.deserializeFast)(base64Decoded, 0, true);

                return {
                    error: false,
                    limit: response.limit,
                    skip: response.skip,
                    result: deserializedBson.slice()
                };
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'count',
        value: function count(query, options) {
            var protocolOpts = {
                url: _client.SDKOptions.COUNT_URL
            };

            var protocol = _protocol.DataProtocol.init(query, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'update',
        value: function update(query, doc, options) {
            var protocolOpts = {
                url: _client.SDKOptions.UPDATE_URL
            };

            var protocol = _protocol.DataProtocol.init(query, doc, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'updateById',
        value: function updateById(query, options) {
            var protocolOpts = {
                url: _client.SDKOptions.UPDATE_BY_ID_URL
            };

            var protocol = _protocol.DataProtocol.init(query, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'remove',
        value: function remove(query, options) {
            var protocolOpts = {
                url: _client.SDKOptions.REMOVE_URL
            };

            var protocol = _protocol.DataProtocol.init(query, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'insert',
        value: function insert(query, options) {
            var protocolOpts = {
                url: _client.SDKOptions.INSERT_URL
            };

            var protocol = _protocol.DataProtocol.init(query, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'uploadFile',
        value: function uploadFile(params, options) {
            var protocolOpts = {
                url: _client.SDKOptions.UPLOAD_URL
            };
            var client = _client.Client.getInstance();
            var protocol = _protocol.DataProtocol.init(params, null, protocolOpts);

            protocol.setAccessKey('acc', client.masterKey || client.fileKey);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'removeFile',
        value: function removeFile(params, options) {
            var protocolOpts = {
                url: _client.SDKOptions.REMOVE_FILE_URL
            };

            var client = _client.Client.getInstance();
            var protocol = _protocol.DataProtocol.init(params, null, protocolOpts);

            protocol.setAccessKey('acc', client.masterKey || client.fileKey);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }]);

    return Network;
}();

}).call(this,require("buffer").Buffer)
},{"../bson":29,"../client":30,"../httpRequest":32,"../protocol":40,"../utils":48,"buffer":4}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCSystem = exports.SCField = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _protocol4 = require('./protocol');

var _utils = require('./utils');

var _httpRequest = require('./httpRequest');

var _client = require('./client');

var _instance = require('./instance');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bot = function () {
    function Bot(data) {
        _classCallCheck(this, Bot);

        this._extend(data);
    }

    _createClass(Bot, [{
        key: '_extend',
        value: function _extend(data) {
            for (var it in data) {
                this[it] = data[it];
            }
        }
    }, {
        key: 'save',
        value: function save() {
            var _this = this;

            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (!this._id) {
                var protocolOpts = {
                    url: _client.SDKOptions.CREATE_BOT_URL
                };

                var protocol = _protocol4.Protocol.init(protocolOpts);
                protocol.setData({
                    bot: this
                });

                var request = new _httpRequest.HttpRequest(protocol);
                var promise = request.execute().then(function (data) {
                    return JSON.parse(data);
                }).then(function (response) {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    _this._extend(response.bot);

                    return _this;
                });
                return _utils.Utils.wrapCallbacks(promise, callbacks);
            } else {
                var _protocolOpts = {
                    url: _client.SDKOptions.UPDATE_BOT_URL
                };

                var _protocol = _protocol4.Protocol.init(_protocolOpts);
                _protocol.setData({
                    bot: this
                });

                var _request = new _httpRequest.HttpRequest(_protocol);
                var _promise = _request.execute().then(function (data) {
                    return JSON.parse(data);
                }).then(function (response) {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    return _this;
                });

                return _promise;
            }
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_BOT_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setData({
                bot: {
                    _id: this._id
                }
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return promise;
        }
    }]);

    return Bot;
}();

var Triggers = function () {
    function Triggers(collName, triggers) {
        _classCallCheck(this, Triggers);

        for (var it in triggers) {
            this[it] = triggers[it];
        }

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    _createClass(Triggers, [{
        key: 'update',
        value: function update() {
            var _this2 = this;

            var protocolOpts = {
                url: _client.SDKOptions.UPDATE_TRIGGERS_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setTriggers(this);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                for (var it in response.triggers) {
                    _this2[it] = response.triggers[it];
                }

                return _this2;
            });

            return promise;
        }
    }]);

    return Triggers;
}();

var SCField = exports.SCField = function () {
    function SCField(collName) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, SCField);

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });

        this._extend(data);
    }

    _createClass(SCField, [{
        key: '_extend',
        value: function _extend(data) {
            for (var prop in data) {
                this[prop] = data[prop];
            }
            return this;
        }
    }, {
        key: 'save',
        value: function save() {
            var _this3 = this;

            var protocolOpts = void 0;

            if (!this.id) {
                protocolOpts = {
                    url: _client.SDKOptions.CREATE_FIELD_URL
                };
            } else {
                protocolOpts = {
                    url: _client.SDKOptions.UPDATE_FIELD_URL
                };
            }

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setField(this);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                _this3._extend(response.field);

                return _this3;
            });

            return promise;
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_FIELD_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setField(this);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return response;
            });

            return promise;
        }
    }]);

    return SCField;
}();

var Index = function () {
    function Index(collName, name, fields) {
        _classCallCheck(this, Index);

        this.name = name;
        this.fields = fields;

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    _createClass(Index, [{
        key: 'save',
        value: function save() {
            var _this4 = this;

            var protocolOpts = {
                url: _client.SDKOptions.CREATE_INDEX_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setIndex(this);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return _this4;
            });

            return promise;
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_INDEX_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setIndex({
                name: this.name
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return response;
            });

            return promise;
        }
    }]);

    return Index;
}();

var Collection = function () {
    function Collection(name) {
        var collection = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Collection);

        this.name = name;
        this.id = '';
        this.useDocsACL = false;
        this.ACL = {
            create: [],
            read: [],
            remove: [],
            update: []
        };
        this.triggers = {
            afterInsert: {
                code: '',
                isActive: false
            },
            afterRemove: {
                code: '',
                isActive: false
            },
            afterUpdate: {
                code: '',
                isActive: false
            },
            beforeInsert: {
                code: '',
                isActive: false
            },
            beforeRemove: {
                code: '',
                isActive: false
            },
            beforeUpdate: {
                code: '',
                isActive: false
            }
        };

        this.fields = [];
        this.indexes = [];

        this._extend(collection);
    }

    _createClass(Collection, [{
        key: '_extend',
        value: function _extend(collection) {
            var _this5 = this;

            for (var it in collection) {
                if (it === 'fields') {
                    this.fields = collection[it].map(function (field) {
                        return new SCField(_this5.name, field);
                    });
                    continue;
                }

                if (it === 'indexes') {
                    this.indexes = collection[it].map(function (index) {
                        return new Index(_this5.name, index.name, index.fields);
                    });
                    continue;
                }

                if (it === 'triggers') {
                    this.triggers = new Triggers(this.name, collection[it]);
                    continue;
                }

                this[it] = collection[it];
            }
        }
    }, {
        key: 'createIndex',
        value: function createIndex(name, fields) {
            var index = new Index(this.name, name, fields);
            return index.save();
        }
    }, {
        key: 'get',
        value: function get() {
            var _this6 = this;

            var protocolOpts = {
                url: _client.SDKOptions.GET_COLLECTION_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setColl(this.name);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                _this6._extend(response.collection);

                return _this6;
            });

            return promise;
        }
    }, {
        key: 'save',
        value: function save() {
            var _this7 = this;

            if (!this.id) {
                var protocolOpts = {
                    url: _client.SDKOptions.CREATE_COLLECTION_URL
                };
                var protocol = _protocol4.Protocol.init(protocolOpts);
                protocol.setData({
                    collection: {
                        name: this.name,
                        ACL: this.ACL,
                        useDocsACL: this.useDocsACL,
                        notify: this.notify
                    }
                });
                var request = new _httpRequest.HttpRequest(protocol);
                var promise = request.execute().then(function (data) {
                    return JSON.parse(data);
                }).then(function (response) {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    _this7._extend(response.collection);

                    return _this7;
                });

                return promise;
            } else {
                var _protocolOpts2 = {
                    url: _client.SDKOptions.UPDATE_COLLECTION_URL
                };
                var _protocol2 = _protocol4.Protocol.init(_protocolOpts2);
                _protocol2.setCollection(this);
                var _request2 = new _httpRequest.HttpRequest(_protocol2);
                var _promise2 = _request2.execute().then(function (data) {
                    return JSON.parse(data);
                }).then(function (response) {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    _this7._extend(response.collection);

                    return _this7;
                });

                return _promise2;
            }
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_COLLECTION_URL
            };
            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setCollection({
                id: this.id
            });
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return promise;
        }
    }, {
        key: 'clone',
        value: function clone(name) {
            var protocolOpts = {
                url: _client.SDKOptions.CLONE_COLLECTION_URL
            };
            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setCollection({
                id: this.id,
                name: name
            });
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new Collection(name, response.collection);
            });

            return promise;
        }
    }]);

    return Collection;
}();

var Folder = function () {
    function Folder(folder) {
        _classCallCheck(this, Folder);

        this._extend(folder);
    }

    _createClass(Folder, [{
        key: '_extend',
        value: function _extend(folder) {
            for (var it in folder) {
                this[it] = folder[it];
            }
        }
    }, {
        key: 'create',
        value: function create() {
            var _this8 = this;

            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.CREATE_FOLDER_URL
            };
            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setPath(this.path);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                _this8._extend(response.folder);
                return _this8;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_FOLDER_URL
            };
            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setPath(this.path);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return promise;
        }
    }]);

    return Folder;
}();

var Script = function () {
    function Script(script) {
        _classCallCheck(this, Script);

        this._extend(script);
    }

    _createClass(Script, [{
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_SCRIPT_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setData({
                script: this._id
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return response;
            });

            return promise;
        }
    }, {
        key: '_extend',
        value: function _extend(script) {
            for (var it in script) {
                this[it] = script[it];
            }
        }
    }, {
        key: 'save',
        value: function save() {
            var _this9 = this;

            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (!this._id) {
                var protocolOpts = {
                    url: _client.SDKOptions.CREATE_SCRIPT_URL
                };
                var protocol = _protocol4.Protocol.init(protocolOpts);
                protocol.setData({
                    cloudCode: this
                });

                var request = new _httpRequest.HttpRequest(protocol);
                var promise = request.execute().then(function (data) {
                    return JSON.parse(data);
                }).then(function (response) {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    _this9._extend(response.script);
                    return _this9;
                });
                return _utils.Utils.wrapCallbacks(promise, callbacks);
            } else {
                var _protocolOpts3 = {
                    url: _client.SDKOptions.UPDATE_SCRIPT_URL
                };

                var _protocol3 = _protocol4.Protocol.init(_protocolOpts3);
                _protocol3.setData({
                    script: this._id,
                    cloudCode: this
                });

                var _request3 = new _httpRequest.HttpRequest(_protocol3);
                var _promise3 = _request3.execute().then(function (data) {
                    return JSON.parse(data);
                }).then(function (response) {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    return _this9;
                });

                return _utils.Utils.wrapCallbacks(_promise3, callbacks);
            }
        }
    }]);

    return Script;
}();

var App = function () {
    function App(data) {
        _classCallCheck(this, App);

        this.Collection = Collection;
        this.Bot = Bot;
        this.Folder = Folder;
        this.Script = Script;

        for (var it in data) {
            this[it] = data[it];
        }
    }

    _createClass(App, [{
        key: 'getCollections',
        value: function getCollections() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.GET_COLLECTIONS_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var colls = [];
                for (var it in response.collections) {
                    colls.push(new Collection(it, response.collections[it]));
                }

                return colls;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getFolderContent',
        value: function getFolderContent(path) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocolOpts = {
                url: _client.SDKOptions.GET_FOLDERS_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setPath(path);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var items = response.items.map(function (item) {
                    if (item.isScript) {
                        return new Script(item);
                    } else {
                        return new Folder(item);
                    }
                });

                return items;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getScript',
        value: function getScript(id) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocolOpts = {
                url: _client.SDKOptions.GET_SCRIPT_URL
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setData({
                script: id
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new Script(response.script);
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getBots',
        value: function getBots(skip, limit) {
            var callbacks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var protocolOpts = {
                url: _client.SDKOptions.GET_BOTS_URL
            };
            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setData({
                skip: skip || 0,
                limit: limit || 50
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.items.map(function (it) {
                    return new Bot(it);
                });
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'updateKey',
        value: function updateKey(type, key) {
            var _this10 = this;

            var callbacks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


            var protocolOpts = {
                url: _client.SDKOptions.UPDATE_APP_KEY
            };
            var protocol = _protocol4.Protocol.init(protocolOpts);
            protocol.setData({
                type: type,
                key: key
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                if (type === 'appId') {
                    _this10[type] = response.result;
                } else {
                    _this10[type][key] = response.result;
                }

                return response;
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getInstances',
        value: function getInstances() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.LIST_INSTANCE_URL
            };
            var protocol = _protocol4.Protocol.init(protocolOpts);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.items.map(function (it) {
                    return new _instance.SCInstance(it);
                });
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }]);

    return App;
}();

var SCSystem = exports.SCSystem = function () {
    function SCSystem() {
        _classCallCheck(this, SCSystem);
    }

    _createClass(SCSystem, [{
        key: 'getDataStats',
        value: function getDataStats() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.DATA_STATS
            };

            var protocol = _protocol4.Protocol.init(protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getApp',
        value: function getApp() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.GET_APP_URL
            };
            var protocol = _protocol4.Protocol.init(protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new App(response.app);
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }]);

    return SCSystem;
}();

},{"./client":30,"./httpRequest":32,"./instance":33,"./protocol":40,"./utils":48}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCUpdateOps = exports.operators = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var operators = {
    set: function set(key, value) {
        if (this instanceof SCUpdateOps || this.attrs['_id']) {
            if (key === 'createdAt' || key === 'updatedAt' || key === '_id') {
                return this;
            }
            if (!this.update['$set']) {
                this.update['$set'] = {};
            }
            this.update['$set'][key] = value;

            if (this.attrs) {
                this.attrs[key] = value;
            }
        } else {
            this.attrs[key] = value;
        }

        return this;
    },
    push: function push(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }

        if (!this.update['$push']) {
            this.update['$push'] = {};
        }
        this.update['$push'][key] = value;

        return this;
    },
    pull: function pull(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }
        }

        if (!this.update['$pull']) {
            this.update['$pull'] = {};
        }
        this.update['$pull'][key] = value;

        return this;
    },
    pullAll: function pullAll(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }
        }

        if (!_utils.Utils.isArray(value)) {
            throw new Error('Value must by a type of array');
        }

        if (!this.update['$pullAll']) {
            this.update['$pullAll'] = {};
        }
        this.update['$pullAll'][key] = value;

        return this;
    },
    addToSet: function addToSet(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }
        }

        if (!this.update['$addToSet']) {
            this.update['$addToSet'] = {};
        }
        this.update['$addToSet'][key] = value;

        return this;
    },
    pop: function pop(key, pos) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }

        if (pos !== 1 && pos !== -1) {
            throw new Error('Position must be 1 or -1');
        }

        if (!this.update['$pop']) {
            this.update['$pop'] = {};
        }
        this.update['$pop'][key] = pos;

        return this;
    },
    inc: function inc(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }
        }

        if (!this.update['$inc']) {
            this.update['$inc'] = {};
        }
        this.update['$inc'][key] = value;

        return this;
    },
    currentDate: function currentDate(key, type) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (type !== true && type !== 'timestamp' && type !== 'date') {
                throw new Error('Invalid type');
            }
        }

        if (!this.update['$currentDate']) {
            this.update['$currentDate'] = {};
        }

        if (type === 'timestamp' || type === 'date') {
            this.update['$currentDate'][key] = { $type: type };
        } else {
            this.update['$currentDate'][key] = type;
        }

        return this;
    },
    mul: function mul(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!_utils.Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$mul']) {
            this.update['$mul'] = {};
        }

        this.update['$mul'][key] = value;

        return this;
    },
    min: function min(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!_utils.Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$min']) {
            this.update['$min'] = {};
        }

        this.update['$min'][key] = value;

        return this;
    },
    max: function max(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!_utils.Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$max']) {
            this.update['$max'] = {};
        }

        this.update['$max'][key] = value;

        return this;
    }
};

var SCUpdateOps = function () {
    function SCUpdateOps() {
        _classCallCheck(this, SCUpdateOps);

        this.update = {};
        for (var prop in operators) {
            this[prop] = operators[prop];
        }
    }

    _createClass(SCUpdateOps, [{
        key: 'toJson',
        value: function toJson() {
            var json = this.update;
            return json;
        }
    }]);

    return SCUpdateOps;
}();

exports.operators = operators;
exports.SCUpdateOps = SCUpdateOps;

},{"./utils":48}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCUser = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _protocol = require('./protocol');

var _httpRequest = require('./httpRequest');

var _utils = require('./utils');

var _client = require('./client');

var _object = require('./object');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SCUser = exports.SCUser = function (_SCObject) {
    _inherits(SCUser, _SCObject);

    function SCUser(user) {
        _classCallCheck(this, SCUser);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SCUser).call(this, 'users', user));
    }

    _createClass(SCUser, [{
        key: 'signup',
        value: function signup() {
            var _this2 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.SIGN_UP_URL
            };

            var data = {
                username: this.attrs.username,
                email: this.attrs.email,
                password: this.attrs.password
            };
            var protocol = _protocol.UserProtocol.init(data, this.attrs, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (response) {
                return JSON.parse(response);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                _utils.Utils.extend(_this2.attrs, response.result);

                return response.result;
            });
            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'logout',
        value: function logout() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.LOGOUT_URL
            };

            var protocol = _protocol.UserProtocol.init(null, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (response) {
                return JSON.parse(response);
            }).then(function (response) {
                if (!response.error) {
                    var client = _client.Client.getInstance();
                    client.sessionId = "";
                }

                return response;
            });
            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'authorize',
        value: function authorize() {
            var _this3 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.GET_AUTH_URL
            };

            var protocol = _protocol.UserProtocol.init(null, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var client = _client.Client.getInstance();
                client.sessionId = response.result.sessionId;

                _utils.Utils.extend(_this3.attrs, response.result.user);

                return response.result.user;
            });
            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'login',
        value: function login(email, password) {
            var _this4 = this;

            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var protocolOpts = {
                url: _client.SDKOptions.LOGIN_URL
            };

            var protocol = _protocol.UserProtocol.init({ email: email, password: password }, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var client = _client.Client.getInstance();
                client.sessionId = response.result.sessionId;

                _utils.Utils.extend(_this4.attrs, response.result.user);

                return response.result.user;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }]);

    return SCUser;
}(_object.SCObject);

},{"./client":30,"./httpRequest":32,"./object":37,"./protocol":40,"./utils":48}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Utils = {};
Utils.isNumber = function (obj) {
    return toString.call(obj) === '[object Number]';
};
Utils.isObject = function (obj) {
    var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
    return type === 'function' || type === 'object' && !!obj;
};
Utils.isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};
Utils.wrapCallbacks = function (promise) {
    var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return promise.then(function (data) {
        if (callbacks.success) {
            callbacks.success(data);
        }
        return data;
    }).catch(function (error) {
        if (callbacks.error) {
            callbacks.error(error);
        }
        return Promise.reject(error);
    });
};
Utils.extend = function (parent, child) {
    for (var prop in child) {
        parent[prop] = child[prop];
    }
};
Utils.removeElement = function (array, el) {
    var arr = array.filter(function (item) {
        if (el !== item) {
            return el;
        }
    });

    return arr;
};
Utils.promiseWhile = function (condition, body) {
    return new Promise(function (resolve, reject) {
        function loop(res) {
            if (!condition(res)) return resolve();
            body(res).then(loop, reject);
        }
        loop();
    });
};

exports.Utils = Utils;

},{}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCWebSocket = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _client = require('./client');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCWebSocket = exports.SCWebSocket = function () {
    function SCWebSocket(chanName) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, SCWebSocket);

        var self = this;

        if (!chanName) {
            throw new Error('Channel name is empty');
        }

        var cl = _client.Client.getInstance();
        var ws = cl.isNode ? require('ws') : WebSocket;

        var AppId = cl.applicationID;
        var wsKey = cl.websocketKey;
        var host = cl.get('WSHOST');
        var protocol = cl.get('WS_PROTOCOL');

        this.wsInstanse = new ws(protocol + '://' + host + '/' + AppId + '/' + wsKey + '/' + chanName);
        this._handlers = {};

        this.wsInstanse.onclose = function (event) {
            self._emit('close', {
                wasClean: event.wasClean,
                code: event.code,
                reason: event.reason
            });
        };
        this.wsInstanse.onerror = function (error) {
            self._emit('error', error);
        };
        this.wsInstanse.onmessage = function (event) {
            self._emit('message', event.data);
        };
        this.wsInstanse.onopen = function () {
            self._emit('open');
        };
    }

    _createClass(SCWebSocket, [{
        key: '_emit',
        value: function _emit() {

            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args[i] = arguments[i];
            }

            var ev = args.shift();

            if (!this._handlers[ev]) {
                this._handlers[ev] = [];
            }

            var ln = this._handlers[ev].length;

            for (var _i = 0; _i < ln; _i++) {
                this._handlers[ev][_i].apply(null, args);
            }
        }
    }, {
        key: 'on',
        value: function on(ev, cb) {
            if (!this._handlers[ev]) {
                this._handlers[ev] = [];
            }

            this._handlers[ev].push(cb);
        }
    }, {
        key: 'send',
        value: function send(msg) {
            this.wsInstanse.send(msg);
        }
    }]);

    return SCWebSocket;
}();

},{"./client":30,"ws":13}]},{},[42])(42)
});