import {Protocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {SDKOptions} from './client'

export class SCSystem {
    constructor() {}
    getDataStats(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.DATA_STATS
        };

        const protocol = Protocol.init(protocolOpts);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });

        return Utils.wrapCallbacks(promise, callbacks);
    }
}