let sharedInstance;
export const SDKOptions = {
    WSHOST: 'wss.scorocode.ru',
    WS_PROTOCOL: 'wss',
    HOST: 'api.scorocode.ru',
    PORT: '443',

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


    TIMEOUT: 5000

};
export class Client {
    constructor(options) {
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
        this.sessionId = "";

        this.host = "https://scorocode.ru";
        this.port = "443";

        /* Not implemented yet */
        if (options.EncryptKey && typeof options.EncryptKey !== 'string') {
            throw new Error('Invalid EncryptKey');
        }
        this.EncryptKey = '';
        this.isNode = false;

        if (typeof process === 'object' && process + '' === '[object process]') {
            this.isNode = true;
        }
    }

    get(key) {
        return SDKOptions[key];
    }

    set(key, value) {
        SDKOptions[key] = value;
    }

    static init(options) {
        const client = new Client(options);
        sharedInstance = client;
        return client;
    }

    static getInstance() {
        return sharedInstance;
    }

}