import {CloudCodeProtocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {SDKOptions} from './client'

export class SCCloudCode {
    constructor(id) {
        if (typeof id !== 'string') {
            throw new Error('Invalid script id');
        }

        this.id = id;
    }
    run(pool = {}, callbacks) {
        if (typeof pool !== 'object') {
            throw new Error('Invalid type of pool');
        }

        let protocolOpts = {
            url: SDKOptions.CLOUD_CODE_URL
        };

        const protocol = CloudCodeProtocol.init({
            script: this.id,
            pool: pool
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