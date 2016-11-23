'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCSystem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _protocol2 = require('./protocol');

var _utils = require('./utils');

var _httpRequest = require('./httpRequest');

var _client = require('./client');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bot = function () {
    function Bot(data) {
        _classCallCheck(this, Bot);

        for (var it in data) {
            this[it] = data[it];
        }
    }

    _createClass(Bot, [{
        key: 'update',
        value: function update() {
            var _this = this;

            var protocolOpts = {
                url: _client.SDKOptions.UPDATE_BOT_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setData({
                bot: this
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return _this;
            });

            return promise;
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_BOT_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setData({
                bot: {
                    _id: this._id
                }
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return promise;
        }
    }]);

    return Bot;
}();

var Triggers = function () {
    function Triggers(collName, triggers) {
        _classCallCheck(this, Triggers);

        for (var it in triggers) {
            this[it] = triggers[it];
        }

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    _createClass(Triggers, [{
        key: 'update',
        value: function update() {
            var _this2 = this;

            var protocolOpts = {
                url: _client.SDKOptions.UPDATE_TRIGGERS_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setTriggers(this);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                for (var it in response.triggers) {
                    _this2[it] = response.triggers[it];
                }

                return _this2;
            });

            return promise;
        }
    }]);

    return Triggers;
}();

var Field = function () {
    function Field(collName) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Field);

        for (var it in data) {
            this[it] = data[it];
        }

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    _createClass(Field, [{
        key: 'create',
        value: function create() {
            var _this3 = this;

            var protocolOpts = {
                url: _client.SDKOptions.CREATE_FIELD_URL
            };
            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setField(this);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                for (var it in response.field) {
                    _this3[it] = response.field[it];
                }

                return _this3;
            });

            return promise;
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_FIELD_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setField(this);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return response;
            });

            return promise;
        }
    }]);

    return Field;
}();

var Index = function () {
    function Index(collName, name, fields) {
        _classCallCheck(this, Index);

        this.name = name;
        this.fields = fields;

        Object.defineProperty(this, 'collName', {
            value: collName,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    _createClass(Index, [{
        key: 'save',
        value: function save() {
            var _this4 = this;

            var protocolOpts = {
                url: _client.SDKOptions.CREATE_INDEX_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setIndex(this);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return _this4;
            });

            return promise;
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_INDEX_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setIndex({
                name: this.name
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return response;
            });

            return promise;
        }
    }]);

    return Index;
}();

var Collection = function () {
    function Collection(name) {
        var collection = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Collection);

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

    _createClass(Collection, [{
        key: '_extend',
        value: function _extend(collection) {
            var _this5 = this;

            for (var it in collection) {
                if (it === 'fields') {
                    this.fields = collection[it].fields.map(function (field) {
                        return new Field(_this5.name, field);
                    });
                    continue;
                }

                if (it === 'indexes') {
                    this.indexes = collection[it].indexes.map(function (index) {
                        return new Index(_this5.name, index.name, index.fields);
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
    }, {
        key: 'createIndex',
        value: function createIndex(name, fields) {
            var index = new Index(this.name, name, fields);
            return index.save();
        }
    }, {
        key: 'createField',
        value: function createField(name, type) {
            var target = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

            var field = new Field(this.name, {
                name: name,
                type: type,
                target: target
            });
            return field.create();
        }
    }, {
        key: 'get',
        value: function get() {
            var _this6 = this;

            var protocolOpts = {
                url: _client.SDKOptions.GET_COLLECTION_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setColl(this.name);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                _this6._extend(response.collection);

                return _this6;
            });

            return promise;
        }
    }, {
        key: 'save',
        value: function save() {
            var _this7 = this;

            if (!this.id) {
                var protocolOpts = {
                    url: _client.SDKOptions.CREATE_COLLECTION_URL
                };
                var protocol = _protocol2.Protocol.init(protocolOpts);
                protocol.setCollection(this);
                var request = new _httpRequest.HttpRequest(protocol);
                var promise = request.execute().then(function (data) {
                    return JSON.parse(data);
                }).then(function (response) {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    _this7._extend(response.collection);

                    return _this7;
                });

                return promise;
            } else {
                var _protocolOpts = {
                    url: _client.SDKOptions.UPDATE_COLLECTION_URL
                };
                var _protocol = _protocol2.Protocol.init(_protocolOpts);
                _protocol.setCollection(this);
                var _request = new _httpRequest.HttpRequest(_protocol);
                var _promise = _request.execute().then(function (data) {
                    return JSON.parse(data);
                }).then(function (response) {
                    if (response.error) {
                        return Promise.reject(response);
                    }

                    _this7._extend(response.collection);

                    return _this7;
                });

                return _promise;
            }
        }
    }, {
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_COLLECTION_URL
            };
            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setCollection({
                id: this.id
            });
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return promise;
        }
    }, {
        key: 'clone',
        value: function clone(name) {
            var protocolOpts = {
                url: _client.SDKOptions.CLONE_COLLECTION_URL
            };
            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setCollection({
                id: this.id,
                name: name
            });
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new Collection(name, response.collection);
            });

            return promise;
        }
    }]);

    return Collection;
}();

var Folder = function () {
    function Folder(folder) {
        _classCallCheck(this, Folder);

        for (var it in folder) {
            this[it] = folder[it];
        }
    }

    _createClass(Folder, [{
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_FOLDER_URL
            };
            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setPath(this.path);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response;
            });

            return promise;
        }
    }]);

    return Folder;
}();

var Script = function () {
    function Script(script) {
        _classCallCheck(this, Script);

        for (var it in script) {
            this[it] = script[it];
        }
    }

    _createClass(Script, [{
        key: 'remove',
        value: function remove() {
            var protocolOpts = {
                url: _client.SDKOptions.DELETE_SCRIPT_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setColl(this.collName);
            protocol.setData({
                script: this._id
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }
                return response;
            });

            return promise;
        }
    }, {
        key: 'update',
        value: function update() {
            var _this8 = this;

            var protocolOpts = {
                url: _client.SDKOptions.UPDATE_SCRIPT_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setData({
                script: this._id,
                cloudCode: this
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return _this8;
            });

            return promise;
        }
    }]);

    return Script;
}();

var App = function () {
    function App(data) {
        _classCallCheck(this, App);

        this.collection = Collection;
        for (var it in data) {
            this[it] = data[it];
        }
    }

    _createClass(App, [{
        key: 'getCollections',
        value: function getCollections() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.GET_COLLECTIONS_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var colls = [];
                for (var it in response.collections) {
                    colls.push(new Collection(it, response.collections[it]));
                }

                return colls;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getFolderContent',
        value: function getFolderContent(path) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocolOpts = {
                url: _client.SDKOptions.GET_FOLDERS_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setPath(path);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var items = response.items.map(function (item) {
                    if (item.isScript) {
                        return new Script(item);
                    } else {
                        return new Folder(item);
                    }
                });

                return items;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'createFolder',
        value: function createFolder(path) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocolOpts = {
                url: _client.SDKOptions.CREATE_FOLDER_URL
            };
            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setPath(path);

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
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

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getScript',
        value: function getScript(id) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocolOpts = {
                url: _client.SDKOptions.GET_SCRIPT_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setData({
                script: id
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new Script(response.script);
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'createScript',
        value: function createScript(data) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocolOpts = {
                url: _client.SDKOptions.CREATE_SCRIPT_URL
            };
            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setData({
                cloudCode: data
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new Script(response.script);
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getBots',
        value: function getBots(skip, limit) {
            var callbacks = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var protocolOpts = {
                url: _client.SDKOptions.GET_BOTS_URL
            };
            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setData({
                skip: skip || 0,
                limit: limit || 50
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.items.map(function (it) {
                    return new Bot(it);
                });
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'createBot',
        value: function createBot(data) {
            var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var protocolOpts = {
                url: _client.SDKOptions.CREATE_BOT_URL
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            protocol.setData({
                bot: data
            });

            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new Bot(response.bot);
            });
            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }]);

    return App;
}();

var SCSystem = exports.SCSystem = function () {
    function SCSystem() {
        _classCallCheck(this, SCSystem);
    }

    _createClass(SCSystem, [{
        key: 'getDataStats',
        value: function getDataStats() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.DATA_STATS
            };

            var protocol = _protocol2.Protocol.init(protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return response.result;
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }, {
        key: 'getApp',
        value: function getApp() {
            var callbacks = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.GET_APP_URL
            };
            var protocol = _protocol2.Protocol.init(protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                return new App(response.app);
            });

            return _utils.Utils.wrapCallbacks(promise, callbacks);
        }
    }]);

    return SCSystem;
}();