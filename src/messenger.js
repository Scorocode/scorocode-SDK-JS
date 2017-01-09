import {SCQuery} from './query'
import {MessengerProtocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {SDKOptions} from './client'
import {SCWebSocket} from './websocket'
import {SCLogger} from './logger'

export class SCMessenger {
    constructor(opt = {}) {
        if (opt.logger instanceof SCLogger) {
            this.logger = opt.logger;
            this._ws = new SCWebSocket("messenger_debugger");
            this._ws.on("open", () => {
                this.logger.log('Debugger is active');
            });
            this._ws.on("error", (err) => {
                this.logger.error(err);
            });
            this._ws.on("message", (msg) => {
                this.logger.log(msg);
            });
        }
    }

    sendPush (options, debug, callbacks = {}) {
        if (typeof options !== 'object') {
            throw new Error('Invalid options type');
        }

        if (!(options.where instanceof SCQuery)) {
            throw new Error('Where must be a type of Query');
        }

        if (typeof options.data !== 'object') {
            throw new Error('Invalid data type');
        }

        if (typeof debug === 'object') {
            callbacks = debug
        }

        let protocolOpts = {
            url: SDKOptions.SEND_PUSH_URL
        };

        let data = {
            msg: options.data,
            debug: debug
        };

        Utils.extend(data, options.where.toJson());

        const protocol = MessengerProtocol.init(data, protocolOpts);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

        return Utils.wrapCallbacks(promise, callbacks);
    }
    sendSms (options, debug, callbacks = {}) {
        if (typeof options !== 'object') {
            throw new Error('Invalid options type');
        }

        if (!(options.where instanceof SCQuery)) {
            throw new Error('Where must be a type of Query');
        }

        if (typeof options.data !== 'object') {
            throw new Error('Invalid data type');
        }

        if (typeof options.data.text !== 'string') {
            throw new Error('Missing subject or text message');
        }

        if (typeof debug === 'object') {
            callbacks = debug
        }

        let protocolOpts = {
            url: SDKOptions.SEND_SMS_URL
        };

        let data = {
            msg: options.data,
            debug: debug
        };

        Utils.extend(data, options.where.toJson());

        const protocol = MessengerProtocol.init(data, protocolOpts);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

        return Utils.wrapCallbacks(promise, callbacks);
    }
}