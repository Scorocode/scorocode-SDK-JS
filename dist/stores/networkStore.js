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

            protocol.setAccessKey('acc', client.fileKey || client.masterKey);

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

            protocol.setAccessKey('acc', client.fileKey || client.masterKey);
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