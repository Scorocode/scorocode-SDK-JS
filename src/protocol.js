import {Client} from './client'
import {Utils} from "./utils"

export class Protocol {
    constructor(client, opts) {
        this.method = 'POST';
        this.host = client.get('HOST');
        this.port = client.get('PORT');
        this.path = opts.url;
        this.data = {
            app: client.applicationID,
            cli: client.clientKey,
            acc: client.masterKey,
            sess: client.sessionId
        };
        this.headers = {
            'Content-Type': 'application/json'
        };
        this.timeout = opts.timeout || client.get('TIMEOUT');
    }

    static init(opts) {
        const client = Client.getInstance();
        const protocol = new Protocol(client, opts);

        return protocol;
    }
    setAccessKey(key, value) {
        this.data[key] = value;
        return this;
    }

    setData(data) {
        for (var prop in data) {
            Object.defineProperty(this.data, prop, {
                value: data[prop],
                enumerable: true,
                writable: true,
                configurable: true
            })
        }

        return this;
    }

    setDoc(doc) {
        if (doc) {
            this.data.doc = doc;
        }

        return this;
    }

    setCollection(coll) {
        this.data.coll = coll;

        return this;
    }

    toJson() {
        const Json = {};

        for (let prop in this) {
            if (prop === 'data') {
                Json[prop] = JSON.stringify(this[prop]);
                continue;
            }
            Json[prop] = this[prop];
        }

        return Json;
    }
}

export class DataProtocol extends Protocol {
    constructor(client, opts) {
        super(client, opts);
    }

    static init(query = {}, doc = {}, opts) {
        const client = Client.getInstance();
        const protocol = new DataProtocol(client, opts);
        protocol.setData(query);
        protocol.setDoc(doc);

        return protocol;
    }
}

export class UserProtocol extends Protocol {
    constructor(client, opts) {
        super(client, opts);
    }

    static init(user, opts) {
        const client = Client.getInstance();
        const protocol = new UserProtocol(client, opts);
        protocol.setData(user);

        return protocol;
    }
}

export class MessengerProtocol extends Protocol {
    constructor(client, options) {
        super(client, options);
    }

    static init(data, options) {
        const client = Client.getInstance();
        const protocol = new MessengerProtocol(client, options);
        protocol.setData(data);
        protocol.setAccessKey('acc', client.messageKey || client.masterKey);
        return protocol;
    }
}

export class CloudCodeProtocol extends Protocol {
    constructor(client, options) {
        super(client, options);
    }

    static init(data, options) {
        const client = Client.getInstance();
        const protocol = new CloudCodeProtocol(client, options);
        protocol.setData(data);
        protocol.setAccessKey('acc', client.scriptKey || client.masterKey);
        return protocol;
    }
}

export class CloudFileProtocol extends Protocol {
    constructor() {
        super();
        this.docId = "";
        this.field = "";
    }
}