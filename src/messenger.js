import {SCQuery} from './query'
import {MessengerProtocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {SDKOptions} from './client'

export class SCMessenger {
    constructor() {}
    sendEmail(options, callbacks = {}){
        if (typeof options !== 'object') {
            throw new Error('Invalid options type');
        }

        if (!(options.where instanceof SCQuery)) {
            throw new Error('Where must be a type of Query');
        }

        if (typeof options.data !== 'object') {
            throw new Error('Invalid data type');
        }

        if (typeof options.data.subject !== 'string' || typeof options.data.text !== 'string') {
            throw new Error('Missing subject or text message');
        }

        let protocolOpts = {
            url: SDKOptions.SEND_EMAIL_URL
        };

        let data = {
            msg: options.data
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
    sendPush (options, callbacks = {}) {
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

        let protocolOpts = {
            url: SDKOptions.SEND_PUSH_URL
        };

        let data = {
            msg: options.data
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
    sendSms (options, callbacks = {}) {
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

        let protocolOpts = {
            url: SDKOptions.SEND_SMS_URL
        };

        let data = {
            msg: options.data
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