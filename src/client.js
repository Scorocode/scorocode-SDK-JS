let sharedInstance;
export const SDKOptions = {
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
        this.sessionId = "";

        this.host = "http://94.126.157.203";
        this.port = "443";

        /* Not implemented yet */
        if (options.EncryptKey && typeof options.EncryptKey !== 'string') {
            throw new Error('Invalid EncryptKey');
        }
        this.EncryptKey = "";
    }

    get(key) {
        return SDKOptions[key];
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