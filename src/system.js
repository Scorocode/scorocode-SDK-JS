import {Protocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {SDKOptions} from './client'

class Bot {
    constructor(data) {
        for (let it in data) {
            this[it] = data[it];
        }
    }

    update() {
        let protocolOpts = {
            url: SDKOptions.UPDATE_BOT_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            bot: this
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

                return this;
            });

        return promise;
    }

    remove() {
        let protocolOpts = {
            url: SDKOptions.DELETE_BOT_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            bot: {
                _id: this._id
            }
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

                return response;
            });

        return promise;
    }

}
class Triggers {
    constructor(collName, triggers) {

        for (let it in triggers) {
            this[it] = triggers[it];
        }

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    update() {
        let protocolOpts = {
            url: SDKOptions.UPDATE_TRIGGERS_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setColl(this.collName);
        protocol.setTriggers(this);

        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                for (let it in response.triggers) {
                    this[it] = response.triggers[it];
                }

                return this;
            });

        return promise;
    }
}

class Field{
    constructor(collName, data = {}){
        for (let it in data) {
            this[it] = data[it];
        }

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    create() {
        let protocolOpts = {
            url: SDKOptions.CREATE_FIELD_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setColl(this.collName);
        protocol.setField(this);

        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                for (let it in response.field) {
                    this[it] = response.field[it];
                }

                return this;
            });

        return promise;

    }

    remove() {
        let protocolOpts = {
            url: SDKOptions.DELETE_FIELD_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setColl(this.collName);
        protocol.setField(this);

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

        return promise;
    }
}

class Index {
    constructor(collName, name, fields){
        this.name = name;
        this.fields = fields;

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        })
    }

    save() {
        let protocolOpts = {
            url: SDKOptions.CREATE_INDEX_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setColl(this.collName);
        protocol.setIndex(this);

        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }
                return this;
            });

        return promise;

    }

    remove() {
        let protocolOpts = {
            url: SDKOptions.DELETE_INDEX_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setColl(this.collName);
        protocol.setIndex({
            name: this.name
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
                return response;
            });

        return promise;
    }
}

class Collection {
    constructor(name, collection = {}) {
        this.name = name;
        this.id = '';
        this.useDocsACL = false;
        this.ACL = {
            create: [],
            read: [],
            remove: [],
            update: []
        };
        this.triggers = {
            afterInsert: {
                code: '',
                isActive: false
            },
            afterRemove: {
                code: '',
                isActive: false
            },
            afterUpdate: {
                code: '',
                isActive: false
            },
            beforeInsert: {
                code: '',
                isActive: false
            },
            beforeRemove: {
                code: '',
                isActive: false
            },
            beforeUpdate: {
                code: '',
                isActive: false
            }
        };

        this.fields = [];
        this.indexes = [];

        this._extend(collection);
    }

    _extend(collection) {
        for (let it in collection) {
            if (it === 'fields') {
                this.fields = collection[it].fields.map((field) => {
                    return new Field(this.name, field);
                });
                continue
            }

            if (it === 'indexes') {
                this.indexes = collection[it].indexes.map((index) => {
                    return new Index(this.name, index.name, index.fields);
                });
                continue;
            }

            if (it === 'triggers') {
                this.triggers = new Triggers(this.name, collection[it]);
                continue;
            }

            this[it] = collection[it];
        }
    }

    createIndex(name, fields) {
        const index = new Index(this.name, name, fields);
        return index.save()
    }

    createField(name, type, target = '') {
        const field = new Field(this.name, {
            name: name,
            type: type,
            target: target
        });
        return field.create()
    }

    get() {
        let protocolOpts = {
            url: SDKOptions.GET_COLLECTION_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setColl(this.name);
        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                this._extend(response.collection);

                return this;
            });

        return promise;
    }

    save() {
        if (!this.id) {
            let protocolOpts = {
                url: SDKOptions.CREATE_COLLECTION_URL
            };
            const protocol = Protocol.init(protocolOpts);
            protocol.setCollection(this);
            const request = new HttpRequest(protocol);
            const promise = request.execute()
                .then(data => {
                    return JSON.parse(data);
                })
                .then(response => {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    this._extend(response.collection);

                    return this;
                });

            return promise;

        } else {
            let protocolOpts = {
                url: SDKOptions.UPDATE_COLLECTION_URL
            };
            const protocol = Protocol.init(protocolOpts);
            protocol.setCollection(this);
            const request = new HttpRequest(protocol);
            const promise = request.execute()
                .then(data => {
                    return JSON.parse(data);
                })
                .then(response => {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    this._extend(response.collection);

                    return this;
                });

            return promise;
        }
    }

    remove() {
        let protocolOpts = {
            url: SDKOptions.DELETE_COLLECTION_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setCollection({
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

                return response;
            });

        return promise;
    }

    clone(name) {
        let protocolOpts = {
            url: SDKOptions.CLONE_COLLECTION_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setCollection({
            id: this.id,
            name: name
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

                return new Collection(name, response.collection);
            });

        return promise;

    }

}

class Folder {
    constructor(folder) {
        for (let it in folder) {
            this[it] = folder[it];
        }
    }

    remove() {
        let protocolOpts = {
            url: SDKOptions.DELETE_FOLDER_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setPath(this.path);

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

        return promise;
    }
}

class Script {
    constructor(script) {
        for (let it in script) {
            this[it] = script[it];
        }
    }

    remove() {
        let protocolOpts = {
            url: SDKOptions.DELETE_SCRIPT_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setColl(this.collName);
        protocol.setData({
            script: this._id
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
                return response;
            });

        return promise;
    }

    update() {
        let protocolOpts = {
            url: SDKOptions.UPDATE_SCRIPT_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            script: this._id,
            cloudCode: this
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

                return this;
            });

        return promise;
    }
}

class App {
    constructor(data){
        this.collection = Collection;
        for (let it in data) {
            this[it] = data[it];
        }
    }


    getCollections(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.GET_COLLECTIONS_URL
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

                let colls = [];
                for (let it in response.collections) {
                    colls.push(new Collection(it, response.collections[it]))
                }

                return colls
            });

        return Utils.wrapCallbacks(promise, callbacks);
    }

    getFolderContent(path, callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.GET_FOLDERS_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setPath(path);

        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                let items = response.items.map((item) => {
                    if (item.isScript) {
                        return new Script(item);
                    } else {
                        return new Folder(item);
                    }
                });

                return items;
            });

        return Utils.wrapCallbacks(promise, callbacks);
    }

    createFolder(path, callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.CREATE_FOLDER_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setPath(path);

        const request = new HttpRequest(protocol);
        const promise = request.execute()
            .then(data => {
                return JSON.parse(data);
            })
            .then(response => {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new Folder({
                    isScript: false,
                    path: path,
                    name: path.split('/').pop(),
                    scriptId: ''
                });
            });

        return Utils.wrapCallbacks(promise, callbacks);
    }

    getScript(id, callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.GET_SCRIPT_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            script: id
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

                return new Script(response.script);
            });
        return Utils.wrapCallbacks(promise, callbacks);
    }

    createScript(data, callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.CREATE_SCRIPT_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            cloudCode: data
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

                return new Script(response.script);
            });
        return Utils.wrapCallbacks(promise, callbacks);

    }

    getBots(skip, limit, callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.GET_BOTS_URL
        };
        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            skip: skip || 0,
            limit: limit || 50
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

                return response.items.map(it => {
                    return new Bot(it);
                });
            });
        return Utils.wrapCallbacks(promise, callbacks);

    }

    createBot(data, callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.CREATE_BOT_URL
        };

        const protocol = Protocol.init(protocolOpts);
        protocol.setData({
            bot: data
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

                return new Bot(response.bot);
            });
        return Utils.wrapCallbacks(promise, callbacks);
    }
}

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

    getApp(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.GET_APP_URL
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

                return new App(response.app);
            });

        return Utils.wrapCallbacks(promise, callbacks);
    }

}