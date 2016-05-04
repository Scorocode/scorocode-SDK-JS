import { SCQuery } from './query';
import { SCUser } from './user';
import { SCObject } from './object';
import { Client } from './client';
import {SCUpdateOps} from './updateOps'
import {SCMessenger} from './messenger'
import {SCCloudCode} from './cloudCode'

var Scorocode = {
    Init: function (opt) {
        const client = Client.init(opt);
        return client;
    }
};

Scorocode.Query = SCQuery;
Scorocode.Object = SCObject;
Scorocode.User = SCUser;
Scorocode.UpdateOps = SCUpdateOps;
Scorocode.Messenger = SCMessenger;
Scorocode.CloudCode = SCCloudCode;

module.exports = Scorocode;