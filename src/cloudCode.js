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
            var channel = id.replace(/\//g,"") + "_debug";
            this._ws = new SCWebSocket(channel);
            this._ws.on("open", () => {});
            this._ws.on("error", (err) => {
                this.logger.error(err);
            });
            this._ws.on("message", (msg) => {
                this.logger.log(msg);
            });
        }

        this.isRunByPath = !!opt.isRunByPath;
        this.id = id;

    }

    runSync(pool = {}, callbacks) {
        if (typeof pool !== 'object') {
            throw new Error('Invalid type of pool');
        }

        let protocolOpts = {
            url: SDKOptions.CLOUD_CODE_URL
        };

        const channelId = parseInt(Math.random() * 10000000);

        const protocol = CloudCodeProtocol.init({
            script: this.isRunByPath ? "" : this.id,
            isRunByPath: this.isRunByPath,
            path: this.isRunByPath ? this.id : "",
            pool: Object.assign({channelId: channelId}, pool),
            debug: false
        }, protocolOpts);

        const promise = new Promise((resolve, reject) => {
            const request = new HttpRequest(protocol);
            var ws = new SCWebSocket(channelId);

            const timeout = setTimeout(() => {
                ws.wsInstanse.close();
                clearTimeout(timeout);
                reject({errMsg: 'Gateway Timeout', errCode: 504, error: true});
            }, 120000);

            ws.on("open", () => {
                request.execute()
                    .then(data => {
                        return JSON.parse(data);
                    })
                    .then(response => {
                        if (response.error) {
                            return reject(response);
                        }
                    });
            });
            ws.on("error", (err) => {
                return reject(err);
            });
            ws.on("message", (msg) => {
                ws.wsInstanse.close();
                clearTimeout(timeout);
                return resolve(msg);
            });

        });

        return Utils.wrapCallbacks(promise, callbacks);
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
            isRunByPath: this.isRunByPath,
            script: this.isRunByPath ? "" : this.id,
            path: this.isRunByPath ? this.id : "",
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