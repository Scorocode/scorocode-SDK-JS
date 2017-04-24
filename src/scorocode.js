import { SCQuery } from './query';
import { SCUser } from './user';
import { SCObject } from './object';
import { Client } from './client';
import {SCUpdateOps} from './updateOps'
import {SCMessenger} from './messenger'
import {SCCloudCode} from './cloudCode'
import {SCWebSocket} from './websocket'
import {SCSystem} from './system'
import {SCLogger} from './logger'
import {SCBot} from './bot'

var Scorocode = {
    Init: function (opt) {
        const client = Client.init(opt);
        return client;
    },
    getSessionId: function() {
        const client = Client.getInstance();
        return client.sessionId;
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

module.exports = Scorocode;