'use strict';

var _query = require('./query');

var _user = require('./user');

var _object = require('./object');

var _client = require('./client');

var _updateOps = require('./updateOps');

var _messenger = require('./messenger');

var _cloudCode = require('./cloudCode');

var _system = require('./system');

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
Scorocode.System = _system.SCSystem;

module.exports = Scorocode;