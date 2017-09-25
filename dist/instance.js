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