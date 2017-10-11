'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CloudFileProtocol = exports.BotProtocol = exports.CloudCodeProtocol = exports.MessengerProtocol = exports.UserProtocol = exports.DataProtocol = exports.Protocol = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _client = require('./client');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Protocol = exports.Protocol = function () {
    function Protocol(client, opts) {
        _classCallCheck(this, Protocol);

        this.method = 'POST';
        this.host = client.get('HOST');
        this.port = client.get('PORT');
        this.path = opts.url;
        this.data = {
            app: client.applicationID,
            cli: client.clientKey,
            acc: client.masterKey
        };
        //sess: client.sessionId
        this.headers = {
            'Content-Type': 'application/json'
        };

        if (client.sessionId) {
            this.headers['Authorization'] = 'Bearer ' + client.sessionId;
        }

        this.timeout = opts.timeout || client.get('TIMEOUT');
    }

    _createClass(Protocol, [{
        key: 'setAccessKey',
        value: function setAccessKey(key, value) {
            this.data[key] = value;
            return this;
        }
    }, {
        key: 'setData',
        value: function setData(data) {
            for (var prop in data) {
                Object.defineProperty(this.data, prop, {
                    value: data[prop],
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
            }

            return this;
        }
    }, {
        key: 'setDoc',
        value: function setDoc(doc) {
            if (doc) {
                this.data.doc = doc;
            }

            return this;
        }
    }, {
        key: 'setIndex',
        value: function setIndex(index) {
            this.data.index = index;
        }
    }, {
        key: 'setField',
        value: function setField(field) {
            this.data.collField = field;
        }
    }, {
        key: 'setPath',
        value: function setPath(path) {
            this.data.path = path;
        }
    }, {
        key: 'setTriggers',
        value: function setTriggers(triggers) {
            this.data.triggers = triggers;
        }
    }, {
        key: 'setColl',
        value: function setColl(coll) {
            this.data.coll = coll;

            return this;
        }
    }, {
        key: 'setCollection',
        value: function setCollection(coll) {
            this.data.collection = coll;

            return this;
        }
    }, {
        key: 'toJson',
        value: function toJson() {
            var Json = {};

            for (var prop in this) {
                if (prop === 'data') {
                    Json[prop] = JSON.stringify(this[prop]);
                    continue;
                }
                Json[prop] = this[prop];
            }

            return Json;
        }
    }], [{
        key: 'init',
        value: function init(opts) {
            var client = _client.Client.getInstance();
            var protocol = new Protocol(client, opts);

            return protocol;
        }
    }]);

    return Protocol;
}();

var DataProtocol = exports.DataProtocol = function (_Protocol) {
    _inherits(DataProtocol, _Protocol);

    function DataProtocol(client, opts) {
        _classCallCheck(this, DataProtocol);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(DataProtocol).call(this, client, opts));
    }

    _createClass(DataProtocol, null, [{
        key: 'init',
        value: function init() {
            var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var doc = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var opts = arguments[2];

            var client = _client.Client.getInstance();
            var protocol = new DataProtocol(client, opts);
            protocol.setData(query);
            protocol.setDoc(doc);

            return protocol;
        }
    }]);

    return DataProtocol;
}(Protocol);

var UserProtocol = exports.UserProtocol = function (_Protocol2) {
    _inherits(UserProtocol, _Protocol2);

    function UserProtocol(client, opts) {
        _classCallCheck(this, UserProtocol);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(UserProtocol).call(this, client, opts));
    }

    _createClass(UserProtocol, null, [{
        key: 'init',
        value: function init(data, doc, opts) {
            var client = _client.Client.getInstance();
            var protocol = new UserProtocol(client, opts);
            protocol.setData(data);
            protocol.setDoc(doc);

            return protocol;
        }
    }]);

    return UserProtocol;
}(Protocol);

var MessengerProtocol = exports.MessengerProtocol = function (_Protocol3) {
    _inherits(MessengerProtocol, _Protocol3);

    function MessengerProtocol(client, options) {
        _classCallCheck(this, MessengerProtocol);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(MessengerProtocol).call(this, client, options));
    }

    _createClass(MessengerProtocol, null, [{
        key: 'init',
        value: function init(data, options) {
            var client = _client.Client.getInstance();
            var protocol = new MessengerProtocol(client, options);
            protocol.setData(data);
            protocol.setAccessKey('acc', client.masterKey || client.messageKey);
            return protocol;
        }
    }]);

    return MessengerProtocol;
}(Protocol);

var CloudCodeProtocol = exports.CloudCodeProtocol = function (_Protocol4) {
    _inherits(CloudCodeProtocol, _Protocol4);

    function CloudCodeProtocol(client, options) {
        _classCallCheck(this, CloudCodeProtocol);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CloudCodeProtocol).call(this, client, options));
    }

    _createClass(CloudCodeProtocol, null, [{
        key: 'init',
        value: function init(data, options) {
            var client = _client.Client.getInstance();
            var protocol = new CloudCodeProtocol(client, options);
            protocol.setData(data);
            protocol.setAccessKey('acc', client.masterKey || client.scriptKey);
            return protocol;
        }
    }]);

    return CloudCodeProtocol;
}(Protocol);

var BotProtocol = exports.BotProtocol = function () {
    function BotProtocol(botId, client, opts) {
        _classCallCheck(this, BotProtocol);

        this.method = 'POST';
        this.host = client.get('BOT_HOST');
        this.port = client.get('PORT');
        this.path = client.get('BOT_URL') + botId + '/response';
        this.data = {};
        this.headers = {
            'Content-Type': 'application/json'
        };
        this.timeout = opts.timeout || client.get('TIMEOUT');
    }

    _createClass(BotProtocol, [{
        key: 'setData',
        value: function setData(data) {
            for (var prop in data) {
                Object.defineProperty(this.data, prop, {
                    value: data[prop],
                    enumerable: true,
                    writable: true,
                    configurable: true
                });
            }
        }
    }, {
        key: 'toJson',
        value: function toJson() {
            var Json = {};

            for (var prop in this) {
                if (prop === 'data') {
                    Json[prop] = JSON.stringify(this[prop]);
                    continue;
                }
                Json[prop] = this[prop];
            }

            return Json;
        }
    }], [{
        key: 'init',
        value: function init(botId) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var client = _client.Client.getInstance();
            var protocol = new BotProtocol(botId, client, options);

            return protocol;
        }
    }]);

    return BotProtocol;
}();

var CloudFileProtocol = exports.CloudFileProtocol = function (_Protocol5) {
    _inherits(CloudFileProtocol, _Protocol5);

    function CloudFileProtocol() {
        _classCallCheck(this, CloudFileProtocol);

        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(CloudFileProtocol).call(this));

        _this5.docId = "";
        _this5.field = "";
        return _this5;
    }

    return CloudFileProtocol;
}(Protocol);