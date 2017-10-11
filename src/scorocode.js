import { SCQuery } from './query';
import { SCUser } from './user';
import { SCObject } from './object';
import { Client } from './client';
import {SCUpdateOps} from './updateOps'
import {SCMessenger} from './messenger'
import {SCCloudCode} from './cloudCode'
import {SCWebSocket} from './websocket'
import {SCSystem, SCField} from './system'
import {SCLogger} from './logger'
import {SCBot} from './bot'
import {SCInstance} from './instance'
import SCObserver from './observer'

var Scorocode = {
    Init: function (opt) {
        const client = Client.init(opt);
        return client;
    },
    getSessionId: function() {
        const client = Client.getInstance();
        return client.sessionId;
    },
    setSessionId: function(sessionId) {
        const client = Client.getInstance();
        client.sessionId = sessionId;
    },
    on: function (e, cb) {
        SCObserver().on(e, cb);
    },
    use: function (cb) {
        const client = Client.getInstance();
        client.middleware.push(cb);
    }
};

Scorocode.Query = SCQuery;
Scorocode.Object = SCObject;
Scorocode.User = SCUser;
Scorocode.UpdateOps = SCUpdateOps;
Scorocode.Messenger = SCMessenger;
Scorocode.CloudCode = SCCloudCode;
Scorocode.WebSocket = SCWebSocket;
Scorocode.System = SCSystem;
Scorocode.Logger = SCLogger;
Scorocode.Bot = SCBot;
Scorocode.Instance = SCInstance;
Scorocode.Field = SCField;

module.exports = Scorocode;