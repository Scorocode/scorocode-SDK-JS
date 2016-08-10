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

        var client = _client.Client.getInstance();
        var ws = client.isNode ? require('ws') : WebSocket;

        var AppId = client.applicationID;
        var wsKey = client.websocketKey;
        var host = client.get('WSHOST');

        this.wsInstanse = new ws('wss://' + host + '/' + AppId + '/' + wsKey + '/' + chanName);
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