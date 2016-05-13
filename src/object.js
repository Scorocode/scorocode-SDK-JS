import {SCQuery} from "./query"
import {Utils} from "./utils"
import {operators} from "./updateOps"
import {DataStore} from "./stores/data"
import {Client} from './client'

export class SCObject {
    constructor(collName) {
        if (typeof collName !== 'string') {
            throw new Error('Invalid collection name');
        }
        
        this.collection = collName;
        this.attrs = {};
        this.update = {};

        for (let prop in operators) {
            this[prop] = operators[prop];
        }
    }
    
    getById(id, options) {
        let query = new SCQuery(this.collection);
        
        const promise = query.equalTo('_id',id).find(options).then(data => {
            if (!data.result.length) {
                throw new Error('Document not found');
            }

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
        return 'https://api.scorocode.ru/api/v1/getfile/' + client.applicationID + '/' + this.collection + '/' + field + '/' + this.attrs[field];
    }

    uploadFile(field, filename, file, options = {}) {
        if (!this.attrs['_id']) {
            throw new Error('You must first create a document');
        }

        let QueryJSON = this.toJson();

        let params = {
            coll: QueryJSON.coll,
            docId: this.attrs['_id'],
            field: field,
            file: filename,
            content: file
        };
        return DataStore.getInstance().uploadFile(params, options).then(data => {

            if (!data.error) {
                this.attrs[field] = data.result;
            }
            return data.result;
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
                data.update = {};
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
        let query = new SCQuery(this.collection);
        return query.equalTo('_id',this.attrs._id).remove(options).then(data => {
            return data;
        });
    }
    
    static extend(params) {
        throw new Error('Not implemented yet');
    }
    

}