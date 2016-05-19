'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCSystem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _protocol = require('./protocol');

var _utils = require('./utils');

var _httpRequest = require('./httpRequest');

var _client = require('./client');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

            var protocol = _protocol.Protocol.init(protocolOpts);
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

    return SCSystem;
}();