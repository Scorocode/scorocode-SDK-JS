import {UserProtocol} from './protocol'
import {HttpRequest} from './httpRequest'
import {Utils} from './utils'
import {Client, SDKOptions} from './client'
import {SCObject} from './object';

export class SCUser extends SCObject{
    constructor() {
        super('users');
    }
    signup(options = {}) {
        let protocolOpts = {
            url: SDKOptions.SIGN_UP_URL
        };

        const protocol = UserProtocol.init(this.attrs, protocolOpts);
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

        const protocol = UserProtocol.init(null, protocolOpts);
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
    login(email, password, options = {}) {
        let protocolOpts = {
            url: SDKOptions.LOGIN_URL
        };

        const protocol = UserProtocol.init({email:email, password: password}, protocolOpts);
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
                
                Utils.extend(this, response.result.user);
            
                return response.result.user;
            });

        return Utils.wrapCallbacks(promise, options);
    }
}