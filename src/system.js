import {Protocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {SDKOptions} from './client'

export class SCSystem {
    constructor() {}
    getDataStats() {
        let protocolOpts = {
            url: SDKOptions.CLOUD_CODE_URL
        };

        const client = Client.getInstance();
        const protocol = Protocol.init(client, protocolOpts);

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