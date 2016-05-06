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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCCloudCode = exports.SCCloudCode = function () {
    function SCCloudCode(id) {
        _classCallCheck(this, SCCloudCode);

        if (typeof id !== 'string') {
            throw new Error('Invalid script id');
        }

        this.id = id;
    }

    _createClass(SCCloudCode, [{
        key: 'run',
        value: function run() {
            var pool = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var callbacks = arguments[1];

            if ((typeof pool === 'undefined' ? 'undefined' : _typeof(pool)) !== 'object') {
                throw new Error('Invalid type of pool');
            }

            var protocolOpts = {
                url: _client.SDKOptions.CLOUD_CODE_URL
            };

            var protocol = _protocol.CloudCodeProtocol.init({
                script: this.id,
                pool: pool
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