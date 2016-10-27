import {CloudCodeProtocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {SDKOptions} from './client'
import {SCWebSocket} from './websocket'
import {SCLogger} from './logger'

export class SCCloudCode {
    constructor(id, opt = {}) {
        if (typeof id !== 'string') {
            throw new Error('Invalid script id');
        }

        if (opt.logger instanceof SCLogger) {
            this.logger = opt.logger;
            this._ws = new SCWebSocket(id + "_debug");
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

        this.id = id;
    }
    run(pool = {}, debug, callbacks) {
        if (typeof pool !== 'object') {
            throw new Error('Invalid type of pool');
        }

        if (typeof debug === 'object') {
            callbacks = debug
        }

        let protocolOpts = {
            url: SDKOptions.CLOUD_CODE_URL
        };

        const protocol = CloudCodeProtocol.init({
            script: this.id,
            pool: pool,
            debug: debug
        }, protocolOpts);


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