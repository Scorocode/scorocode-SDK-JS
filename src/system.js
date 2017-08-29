import {Protocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'
import {SDKOptions} from './client'
import {SCInstance} from './instance'
class Bot {
    constructor(data) {
        this._extend(data);
    }

    _extend(data) {
        for (let it in data) {
            this[it] = data[it];
        }
    }

    save(callbacks = {}) {
        if (!this._id) {
            let protocolOpts = {
                url: SDKOptions.CREATE_BOT_URL
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

                    this._extend(response.bot);

                    return this;
                });
            return Utils.wrapCallbacks(promise, callbacks);
        } else {
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

export class SCField {
    constructor(collName, data = {}){

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });

        this._extend(data);

    }

    _extend(data) {
        for (let prop in data) {
            this[prop] = data[prop];
        }
        return this;
    }

    save() {
        let protocolOpts;

        if (!this.id) {
            protocolOpts = {
                url: SDKOptions.CREATE_FIELD_URL
            };
        } else {
            protocolOpts = {
                url: SDKOptions.UPDATE_FIELD_URL
            };
        }

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

                this._extend(response.field);

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
                this.fields = collection[it].map((field) => {
                    return new SCField(this.name, field);
                });
                continue
            }

            if (it === 'indexes') {
                this.indexes = collection[it].map((index) => {
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
        this._extend(folder);
    }

    _extend(folder) {
        for (let it in folder) {
            this[it] = folder[it];
        }
    }

    create(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.CREATE_FOLDER_URL
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

                this._extend(response.folder);
                return this;
            });

        return Utils.wrapCallbacks(promise, callbacks);
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
        this._extend(script);
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

    _extend(script) {
        for (let it in script) {
            this[it] = script[it];
        }
    }

    save(callbacks = {}) {
        if (!this._id) {
            let protocolOpts = {
                url: SDKOptions.CREATE_SCRIPT_URL
            };
            const protocol = Protocol.init(protocolOpts);
            protocol.setData({
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

                    this._extend(response.script);
                    return this;
                });
            return Utils.wrapCallbacks(promise, callbacks);
        } else {
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

            return Utils.wrapCallbacks(promise, callbacks);
        }
    }
}

class App {
    constructor(data){
        this.Collection = Collection;
        this.Bot = Bot;
        this.Folder = Folder;
        this.Script = Script;

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

    getInstances(callbacks = {}) {
        let protocolOpts = {
            url: SDKOptions.LIST_INSTANCE_URL
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

                return response.items.map(it => {
                    return new SCInstance(it);
                });
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