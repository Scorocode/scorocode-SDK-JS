import { Client } from './client';

export class SCWebSocket {
    constructor(chanName, options = {}) {
        var self = this;

        if (!chanName) {
            throw new Error('Channel name is empty');
        }

        var cl = Client.getInstance();
        const ws = cl.isNode ? require('ws') : WebSocket;

        let AppId = cl.applicationID;
        let wsKey = cl.websocketKey;
        let host = cl.get('WSHOST');
        let protocol = cl.get('WS_PROTOCOL');

        this.wsInstanse = new ws(protocol+'://' + host + '/' + AppId + '/' + wsKey + '/' + chanName);
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
    _emit () {

        let args = [];
        for (let i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }

        let ev = args.shift();

        if (!this._handlers[ev]) {
            this._handlers[ev] = [];
        }

        let ln = this._handlers[ev].length;

        for (let i = 0; i < ln; i++) {
            this._handlers[ev][i].apply(null, args);
        }
    }
    on (ev, cb) {
        if (!this._handlers[ev]) {
            this._handlers[ev] = [];
        }

        this._handlers[ev].push(cb);
    }
    send (msg) {
        this.wsInstanse.send(msg);
    }
}