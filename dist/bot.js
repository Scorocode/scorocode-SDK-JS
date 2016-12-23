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