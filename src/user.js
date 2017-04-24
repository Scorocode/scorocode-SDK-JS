import {UserProtocol} from './protocol'
import {HttpRequest} from './httpRequest'
import {Utils} from './utils'
import {Client, SDKOptions} from './client'
import {SCObject} from './object';

export class SCUser extends SCObject{
    constructor(user) {
        super('users', user);
    }

    signup(options = {}) {
        let protocolOpts = {
            url: SDKOptions.SIGN_UP_URL
        };

        let data = {
            username: this.attrs.username,
            email: this.attrs.email,
            password: this.attrs.password
        };
        const protocol = UserProtocol.init(data, this.attrs, protocolOpts);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(response => {
                return JSON.parse(response);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }
                
                Utils.extend(this.attrs, response.result);
            
                return response.result;
            });
        return Utils.wrapCallbacks(promise, options);
    }

    logout(options = {}) {
        let protocolOpts = {
            url: SDKOptions.LOGOUT_URL
        };

        const protocol = UserProtocol.init(null, null, protocolOpts);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(response => {
                return JSON.parse(response);
            })
            .then(response => {
                if (!response.error) {
                    const client = Client.getInstance();
                    client.sessionId = "";
                }
                
                return response;
            });
        return Utils.wrapCallbacks(promise, options);
    }

    static authorize(options = {}) {
        let protocolOpts = {
            url: SDKOptions.GET_AUTH_URL
        };

        const protocol = UserProtocol.init(null, null, protocolOpts);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                const client = Client.getInstance();
                client.sessionId = response.result.sessionId;

                Utils.extend(this.attrs, response.result.user);

                return response.result.user;
            });
        return Utils.wrapCallbacks(promise, options);
    }

    login(email, password, options = {}) {
        let protocolOpts = {
            url: SDKOptions.LOGIN_URL
        };

        const protocol = UserProtocol.init({email:email, password: password}, null, protocolOpts);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                const client = Client.getInstance();
                client.sessionId = response.result.sessionId;
                
                Utils.extend(this.attrs, response.result.user);
            
                return response.result.user;
            });

        return Utils.wrapCallbacks(promise, options);
    }
}