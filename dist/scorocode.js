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

var Scorocode = {
    Init: function Init(opt) {
        var client = _client.Client.init(opt);
        return client;
    }
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

module.exports = Scorocode;