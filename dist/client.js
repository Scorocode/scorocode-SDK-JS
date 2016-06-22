"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sharedInstance = void 0;
var SDKOptions = exports.SDKOptions = {
    HOST: "api.scorocode.ru",
    PORT: "443",

    FIND_URL: "/api/v1/data/find",
    COUNT_URL: "/api/v1/data/count",
    UPDATE_URL: "/api/v1/data/update",
    UPDATE_BY_ID_URL: "/api/v1/data/updatebyid",
    REMOVE_URL: "/api/v1/data/remove",
    INSERT_URL: "/api/v1/data/insert",

    SEND_EMAIL_URL: "/api/v1/sendemail",
    SEND_PUSH_URL: "/api/v1/sendpush",
    SEND_SMS_URL: "/api/v1/sendsms",

    CLOUD_CODE_URL: "/api/v1/scripts",

    UPLOAD_URL: "/api/v1/upload",
    GET_FILE_LINK_URL: "",

    SIGN_UP_URL: "/api/v1/register",
    LOGOUT_URL: "/api/v1/logout",
    LOGIN_URL: "/api/v1/login",

    DATA_STATS: '/api/v1/stat',

    TIMEOUT: 5000

};

var Client = exports.Client = function () {
    function Client(options) {
        _classCallCheck(this, Client);

        if (typeof options.ApplicationID !== 'string') {
            throw new Error('Invalid Application ID');
        }

        if (typeof options.JavaScriptKey !== 'string') {
            throw new Error('Invalid JavaScript Key');
        }

        if (options.MasterKey && typeof options.MasterKey !== 'string') {
            throw new Error('Invalid MasterKey');
        }

        this.applicationID = options.ApplicationID;
        this.clientKey = options.JavaScriptKey;
        this.masterKey = options.MasterKey || "";
        this.messageKey = options.MessageKey || "";
        this.scriptKey = options.ScriptKey || "";
        this.fileKey = options.FileKey || "";
        this.sessionId = "";

        this.host = "https://scorocode.ru";
        this.port = "443";

        /* Not implemented yet */
        if (options.EncryptKey && typeof options.EncryptKey !== 'string') {
            throw new Error('Invalid EncryptKey');
        }
        this.EncryptKey = "";
    }

    _createClass(Client, [{
        key: "get",
        value: function get(key) {
            return SDKOptions[key];
        }
    }, {
        key: "set",
        value: function set(key, value) {
            SDKOptions[key] = value;
        }
    }], [{
        key: "init",
        value: function init(options) {
            var client = new Client(options);
            sharedInstance = client;
            return client;
        }
    }, {
        key: "getInstance",
        value: function getInstance() {
            return sharedInstance;
        }
    }]);

    return Client;
}();