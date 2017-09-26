import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {Protocol} from './protocol'
import {SDKOptions} from './client'

export class SCInstance {
    constructor(data) {
        this._extend(data);
    }

    _extend(data) {
        for (let it in data) {
            this[it] = data[it];
        }
    }

    save(callbacks = {}) {
        let protocolOpts = !this.id ? {
            url: SDKOptions.CREATE_INSTANCE_URL
        } : {
            url: SDKOptions.UPDATE_INSTANCE_URL
        };


        const protocol = Protocol.init(protocolOpts);


        protocol.setData({
            id: this.id || null,
            name: this.name,
            autorun: this.autorun || []
        });

        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }
                this._extend(response.result);
                return this;
            });
        return Utils.wrapCallbacks(promise, callbacks);
    }

    remove(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.REMOVE_INSTANCE_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            id: this.id
        });

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

    run(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.RUN_INSTANCE_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            id: this.id
        });

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

    stop(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.STOP_INSTANCE_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            id: this.id
        });

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

    runScript(path, pool = {}, callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.RUN_SCRIPT_INSTANCE_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            id: this.id,
            path: path,
            pool: pool
        });

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

    killScript(pid, callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.KILL_SCRIPT_INSTANCE_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            id: this.id,
            pid: pid
        });

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

    getScripts(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.SCRIPTS_INSTANCE_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            id: this.id
        });

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