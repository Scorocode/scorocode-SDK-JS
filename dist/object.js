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
    function SCObject(collName) {
        _classCallCheck(this, SCObject);

        if (typeof collName !== 'string') {
            throw new Error('Invalid collection name');
        }

        this.collection = collName;
        this.attrs = {};
        this.update = {};

        for (var prop in _updateOps.operators) {
            this[prop] = _updateOps.operators[prop];
        }
    }

    _createClass(SCObject, [{
        key: "getById",
        value: function getById(id, options) {
            var _this = this;

            var query = new _query.SCQuery(this.collection);

            var promise = query.equalTo('_id', id).find(options).then(function (data) {
                if (!data.result.length) {
                    throw new Error('Document not found');
                }

                _utils.Utils.extend(_this, data.result[0]);

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
            return 'https://api.scorocode.ru/api/v1.0/getfile/' + client.applicationID + '/' + this.collection + '/' + field + '/' + this.attrs[field];
        }
    }, {
        key: "uploadFile",
        value: function uploadFile(field, filename, file) {
            var _this2 = this;

            var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

            if (!this.attrs['_id']) {
                throw new Error('You must first create a document');
            }

            var QueryJSON = this.toJSON();

            var params = {
                coll: QueryJSON.coll,
                docId: this.attrs['_id'],
                field: field,
                file: filename,
                content: file
            };
            return _data.DataStore.getInstance().uploadFile(params, options).then(function (data) {

                if (!data.error) {
                    _this2.attrs[field] = data.result;
                }
                return data.result;
            });
        }
    }, {
        key: "toJSON",
        value: function toJSON() {
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
            var _this3 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (this.attrs['_id']) {
                return _data.DataStore.getInstance().updateById(this.toJSON(), options).then(function (data) {
                    if (!data.error) {
                        _this3.attrs = data.result;
                    }
                    data.update = {};
                    return data.result;
                });
            }

            return _data.DataStore.getInstance().insert(this.toJSON(), options).then(function (data) {
                if (!data.error) {
                    _this3.attrs = data.result;
                }
                return data.result;
            });
        }
    }, {
        key: "remove",
        value: function remove() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var query = new _query.SCQuery(this.collection);
            return query.equalTo('_id', this.attrs._id).remove(options).then(function (data) {
                return data;
            });
        }
    }], [{
        key: "extend",
        value: function extend(params) {
            throw new Error('Not implemented yet');
        }
    }]);

    return SCObject;
}();