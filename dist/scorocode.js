'use strict';

var _query = require('./query');

var _user = require('./user');

var _object = require('./object');

var _client = require('./client');

var _updateOps = require('./updateOps');

var _messenger = require('./messenger');

var _cloudCode = require('./cloudCode');

var _websocket = require('./websocket');

var _system = require('./system');

var _logger = require('./logger');

var _bot = require('./bot');

var _instance = require('./instance');

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Scorocode = {
    Init: function Init(opt) {
        var client = _client.Client.init(opt);
        return client;
    },
    getSessionId: function getSessionId() {
        var client = _client.Client.getInstance();
        return client.sessionId;
    },
    setSessionId: function setSessionId(sessionId) {
        var client = _client.Client.getInstance();
        client.sessionId = sessionId;
    },
    on: function on(e, cb) {
        (0, _observer2.default)().on(e, cb);
    },
    use: function use(cb) {}
};

Scorocode.Query = _query.SCQuery;
Scorocode.Object = _object.SCObject;
Scorocode.User = _user.SCUser;
Scorocode.UpdateOps = _updateOps.SCUpdateOps;
Scorocode.Messenger = _messenger.SCMessenger;
Scorocode.CloudCode = _cloudCode.SCCloudCode;
Scorocode.WebSocket = _websocket.SCWebSocket;
Scorocode.System = _system.SCSystem;
Scorocode.Logger = _logger.SCLogger;
Scorocode.Bot = _bot.SCBot;
Scorocode.Instance = _instance.SCInstance;
Scorocode.Field = _system.SCField;

module.exports = Scorocode;