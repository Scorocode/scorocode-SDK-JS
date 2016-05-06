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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCMessenger = exports.SCMessenger = function () {
    function SCMessenger() {
        _classCallCheck(this, SCMessenger);
    }

    _createClass(SCMessenger, [{
        key: 'sendEmail',
        value: function sendEmail(options) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
                throw new Error('Invalid options type');
            }

            if (!(options.where instanceof _query.SCQuery)) {
                throw new Error('Where must be a type of Query');
            }

            if (_typeof(options.data) !== 'object') {
                throw new Error('Invalid data type');
            }

            if (typeof options.data.subject !== 'string' || typeof options.data.text !== 'string') {
                throw new Error('Missing subject or text message');
            }

            var protocolOpts = {
                url: _client.SDKOptions.SEND_EMAIL_URL
            };

            var data = {
                msg: options.data
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
        key: 'sendPush',
        value: function sendPush(options) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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

            var protocolOpts = {
                url: _client.SDKOptions.SEND_PUSH_URL
            };

            var data = {
                msg: options.data
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
        value: function sendSms(options) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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

            var protocolOpts = {
                url: _client.SDKOptions.SEND_SMS_URL
            };

            var data = {
                msg: options.data
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