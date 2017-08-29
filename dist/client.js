'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sharedInstance = void 0;
var SDKOptions = exports.SDKOptions = {
    WSHOST: 'wss.scorocode.ru',
    WS_PROTOCOL: 'wss',
    HOST: 'api.scorocode.ru',
    PORT: '443',

    CREATE_INSTANCE_URL: '/api/v1/instance/create',
    REMOVE_INSTANCE_URL: '/api/v1/instance/delete',
    RUN_INSTANCE_URL: '/api/v1/instance/run',
    STOP_INSTANCE_URL: '/api/v1/instance/stop',
    LIST_INSTANCE_URL: '/api/v1/instance',
    SCRIPTS_INSTANCE_URL: '/api/v1/instance/scripts',
    RUN_SCRIPT_INSTANCE_URL: '/api/v1/instance/scripts/run',
    KILL_SCRIPT_INSTANCE_URL: '/api/v1/instance/scripts/delete',

    GET_AUTH_URL: '/api/v1/verifylogin',

    FIND_URL: '/api/v1/data/find',
    COUNT_URL: '/api/v1/data/count',
    UPDATE_URL: '/api/v1/data/update',
    UPDATE_BY_ID_URL: '/api/v1/data/updatebyid',
    REMOVE_URL: '/api/v1/data/remove',
    INSERT_URL: '/api/v1/data/insert',

    SEND_PUSH_URL: '/api/v1/sendpush',
    SEND_SMS_URL: '/api/v1/sendsms',

    CLOUD_CODE_URL: '/api/v1/scripts',

    UPLOAD_URL: '/api/v1/upload',
    REMOVE_FILE_URL: '/api/v1/deletefile',
    GET_FILE_LINK_URL: '',

    SIGN_UP_URL: '/api/v1/register',
    LOGOUT_URL: '/api/v1/logout',
    LOGIN_URL: '/api/v1/login',

    DATA_STATS: '/api/v1/stat',

    BOT_HOST: 'bots.scorocode.ru',
    BOT_URL: '/bots/',

    /* Работа с приложением */
    GET_APP_URL: '/api/v1/app',
    GET_COLLECTIONS_URL: '/api/v1/app/collections',
    GET_COLLECTION_URL: '/api/v1/app/collections/get',
    CREATE_COLLECTION_URL: '/api/v1/app/collections/create',
    UPDATE_COLLECTION_URL: '/api/v1/app/collections/update',
    DELETE_COLLECTION_URL: '/api/v1/app/collections/delete',
    CLONE_COLLECTION_URL: '/api/v1/app/collections/clone',
    CREATE_INDEX_URL: '/api/v1/app/collections/index/create',
    DELETE_INDEX_URL: '/api/v1/app/collections/index/delete',
    CREATE_FIELD_URL: '/api/v1/app/collections/fields/create',
    UPDATE_FIELD_URL: '/api/v1/app/collections/fields/update',
    DELETE_FIELD_URL: '/api/v1/app/collections/fields/delete',
    UPDATE_TRIGGERS_URL: '/api/v1/app/collections/triggers',
    GET_FOLDERS_URL: '/api/v1/app/scripts/folders',
    CREATE_FOLDER_URL: '/api/v1/app/scripts/folders/create',
    DELETE_FOLDER_URL: '/api/v1/app/scripts/folders/delete',
    GET_SCRIPT_URL: '/api/v1/app/scripts/get',
    CREATE_SCRIPT_URL: '/api/v1/app/scripts/create',
    UPDATE_SCRIPT_URL: '/api/v1/app/scripts/update',
    DELETE_SCRIPT_URL: '/api/v1/app/scripts/delete',
    GET_BOTS_URL: '/api/v1/bots',
    CREATE_BOT_URL: '/api/v1/bots/create',
    UPDATE_BOT_URL: '/api/v1/bots/update',
    DELETE_BOT_URL: '/api/v1/bots/delete',
    TIMEOUT: 120000

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
        this.websocketKey = options.WebSocketKey || "";
        this.sessionId = options.sessionId || "";

        this.host = "https://scorocode.ru";
        this.port = "443";

        /* Not implemented yet */
        if (options.EncryptKey && typeof options.EncryptKey !== 'string') {
            throw new Error('Invalid EncryptKey');
        }
        this.EncryptKey = '';
        this.isNode = false;

        if ((typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && process + '' === '[object process]') {
            this.isNode = true;
        }
    }

    _createClass(Client, [{
        key: 'get',
        value: function get(key) {
            return SDKOptions[key];
        }
    }, {
        key: 'set',
        value: function set(key, value) {
            SDKOptions[key] = value;
        }
    }], [{
        key: 'init',
        value: function init(options) {
            var client = new Client(options);
            sharedInstance = client;
            return client;
        }
    }, {
        key: 'getInstance',
        value: function getInstance() {
            return sharedInstance;
        }
    }]);

    return Client;
}();