import {DataProtocol, CloudProtocol} from '../protocol'
import {HttpRequest} from '../httpRequest'
import {Utils} from '../utils'
import {deserializeFast} from '../bson'
import {SDKOptions, Client} from '../client'

export class Network {
    constructor() {}

    find(query, options) {
        let protocolOpts = {
            url: SDKOptions.FIND_URL
        };

        const protocol = DataProtocol.init(query, null, protocolOpts);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
        .then(data => {
            return JSON.parse(data);
        })
        .then(response => {
            if (response.error) {
                return Promise.reject(response);
            }

            let base64Decoded = new Buffer(response.result, 'base64');
            let deserializedBson = deserializeFast(base64Decoded, 0, true);

            return {
                error: false,
                limit: response.limit,
                skip: response.skip,
                result: deserializedBson.slice()
            };
        });
        
        return Utils.wrapCallbacks(promise, options);
    }
    count(query, options) {
        let protocolOpts = {
            url: SDKOptions.COUNT_URL
        };

        const protocol = DataProtocol.init(query, null, protocolOpts);
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

        return Utils.wrapCallbacks(promise, options);
    }
    update(query, doc, options) {
        let protocolOpts = {
            url: SDKOptions.UPDATE_URL
        };

        const protocol = DataProtocol.init(query, doc, protocolOpts);
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

        return Utils.wrapCallbacks(promise, options);
    }
    updateById (query, options) {
        let protocolOpts = {
            url: SDKOptions.UPDATE_BY_ID_URL
        };

        const protocol = DataProtocol.init(query, null, protocolOpts);
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
        
        return Utils.wrapCallbacks(promise, options);
    }
    remove(query, options) {
        let protocolOpts = {
            url: SDKOptions.REMOVE_URL
        };

        const protocol = DataProtocol.init(query, null, protocolOpts);
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

        return Utils.wrapCallbacks(promise, options);
    }
    insert(query, options) {
        let protocolOpts = {
            url: SDKOptions.INSERT_URL
        };

        const protocol = DataProtocol.init(query, null, protocolOpts);
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

        return Utils.wrapCallbacks(promise, options);
    }

    uploadFile(params, options) {
        let protocolOpts = {
            url: SDKOptions.UPLOAD_URL
        };
        const client = Client.getInstance();
        const protocol = DataProtocol.init(params, null, protocolOpts);

        protocol.setAccessKey('acc', client.fileKey || client.masterKey);

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

        return Utils.wrapCallbacks(promise, options);
    }
    removeFile(params, options) {
        let protocolOpts = {
            url: SDKOptions.REMOVE_FILE_URL
        };

        const client = Client.getInstance();
        const protocol = DataProtocol.init(params, null, protocolOpts);

        protocol.setAccessKey('acc', client.fileKey || client.masterKey);
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

        return Utils.wrapCallbacks(promise, options);
    }
}