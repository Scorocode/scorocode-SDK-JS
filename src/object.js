import {SCQuery} from "./query"
import {Utils} from "./utils"
import {operators} from "./updateOps"
import {DataStore} from "./stores/data"
import {Client} from './client'

export class SCObject {
    constructor(collName, model) {
        if (typeof collName !== 'string') {
            throw new Error('Invalid collection name');
        }
        
        this.collection = collName;
        this.attrs = Object.assign({}, model);
        this.update = {};

        for (let prop in operators) {
            this[prop] = operators[prop];
        }
    }

    setAttrs (obj) {
        const model = Object.assign({}, obj);
        for (let item in model) {
            this.set(item, model[item]);
        }
    }

    getAttrs () {
        return Object.assign({}, this.attrs);
    }

    getById(id, options) {
        let query = new SCQuery(this.collection);

        if (!id) {
            throw new Error('Id is empty');
        }

        const promise = query.equalTo('_id',id).find(options).then(data => {
            if (!data.result.length) {
                throw new Error('Document not found');
            }

            this.attrs = {};
            Utils.extend(this.attrs, data.result[0]);
            
            return data.result[0];
        });

        return promise;
    }

    get(key) {
        return this.attrs[key];
    }

    getFileLink(field) {
        if (!this.attrs['_id']) {
            throw new Error('You must first create a document and upload file');
        }

        if (!this.attrs.hasOwnProperty(field)) {
            throw new Error('Unknown field');
        }

        if (!this.attrs[field]) {
            throw new Error('Field is empty');
        }

        const client = Client.getInstance();
        return 'https://api.scorocode.ru/api/v1/getfile/' + client.applicationID + '/' + this.collection + '/' + field + '/' + this.attrs._id + '/' + this.attrs[field];
    }

    removeFile(field, options = {}) {
        if (!this.attrs['_id']) {
            throw new Error('You must first create a document and upload file');
        }

        if (!this.attrs.hasOwnProperty(field)) {
            throw new Error('Unknown field');
        }

        if (!this.attrs[field]) {
            throw new Error('Field is empty');
        }

        let QueryJSON = this.toJson();
        let params = {
            coll: QueryJSON.coll,
            docId: this.attrs['_id'],
            field: field,
            file: this.attrs[field]
        };
        return DataStore.getInstance().removeFile(params, options).then(data => {
            if (!data.error) {
                this.attrs[field] = '';
            }
            return data;
        });
    }

    uploadFile(field, filename, file, options = {}) {
        if (!this.attrs['_id']) {
            throw new Error('You must first create a document');
        }

        var base64 = file.split(',');
        var base64result = "";

        if (base64.length == 2) {
            base64result = base64[1];
        } else {
            base64result = base64[0];
        }

        let QueryJSON = this.toJson();

        let params = {
            coll: QueryJSON.coll,
            docId: this.attrs['_id'],
            field: field,
            file: filename,
            content: base64result
        };
        return DataStore.getInstance().uploadFile(params, options).then(data => {

            if (!data.error) {
                this.attrs[field] = data.result;
            }
            return data;
        });
    }

    toJson() {
        const json = {
            coll: this.collection,
            query: this.attrs['_id'] ? { _id: this.attrs['_id']} : {},
            doc: this.attrs['_id'] ? this.update : this.attrs 
        };
        return json;
    }

    save(options = {}) {
        if (this.attrs['_id']) {
            return DataStore.getInstance().updateById(this.toJson(), options).then(data => {
                if (!data.error) {
                    this.attrs = data.result;
                }
                this.update = {};
                return data.result;
            });
        }

        return DataStore.getInstance().insert(this.toJson(), options).then(data => {
            if (!data.error) {
                this.attrs = data.result;
            }
            return data.result;
        });
    }

    remove(options = {}) {
        if (!this.attrs['_id']) {
            throw new Error("Document does't exist");
        }
        let query = new SCQuery(this.collection);
        return query.equalTo('_id',this.attrs._id).remove(options).then(data => {
            return data;
        });
    }

    static extend(collName, childObject) {
        const obj = new SCObject(collName);
        for (let prop in childObject) {
            obj.attrs[prop] = childObject[prop];
        }

        return obj;
    }

}