import {Utils} from "./utils"
import {DataStore} from "./stores/data"

export class SCQuery {
    constructor (collName) {
        if (typeof collName !== 'string') {
            throw new Error('Collection name must be a type of string');
        }
        this._collection = collName;
        this._fields = [];
        this._filter = {};
        this._sort = {};
        this._limit = 100;
        this._skip = 0;
    }

    _addFilter(field, condition, values) {
        if (!Utils.isObject(this._filter[field])) {
            this._filter[field] = {};
        }

        this._filter[field][condition] = values;
        return this;
    }

    find(options = {}) {
        return DataStore.getInstance().find(this.toJson(), options);
    }
    count(options = {}) {
        return DataStore.getInstance().count(this.toJson(), options);
    }
    update(object, options = {}) {
        return DataStore.getInstance().update(this.toJson(), object.toJson(), options);
    }
    remove(options = {}) {
        return DataStore.getInstance().remove(this.toJson(), options);
    }
    
    reset() {
        this._filter = {};
        this.fields = [];
        
        return this;
    }

    equalTo(field, value) {
        this._filter[field] = value;
        return this;
    }
    notEqualTo(field, value) {
        return this._addFilter(field, "$ne", value);
    }

    containedIn(field,value) {
        if (!Utils.isArray(value)) {
            throw new Error('Value must be of type: Array');
        }

        return this._addFilter(field, '$in', value);
    }
    containsAll(field, value) {
        if (!Utils.isArray(value)) {
            throw new Error('Value must be of type: Array');
        }

        return this._addFilter(field, '$all', value);
    }
    notContainedIn(field, value) {
        if (!Utils.isArray(value)) {
            throw new Error('Value must be of type: Array');
        }

        return this._addFilter(field, '$nin', value);
    }

    greaterThan(field, value) {
        return this._addFilter(field, '$gt', value);
    }
    greaterThanOrEqualTo(field, value) {
        return this._addFilter(field, '$gte', value);
    }
    lessThan(field, value) {
        return this._addFilter(field, '$lt', value);
    }
    lessThanOrEqualTo(field, value) {
        return this._addFilter(field, '$lte', value);
    }

    exists(field) {
        return this._addFilter(field, '$exists', true);
    }
    doesNotExist(field) {
        return this._addFilter(field, '$exists', false);
    }

    contains(field,value) {
        if (!Utils.isArray(value)) {
            throw new Error('Value must be of type: Array');
        }

        return this._addFilter(field, '$reqex', value);
    }
    startsWith(field, value) {
        if (typeof value !== 'string') {
            throw new Error("Value must be a string");
        }

        return this._addFilter(field, '$regex', '^' + value);
    }
    endsWith(field, value) {
        if (typeof value !== 'string') {
            throw new Error("Value must be a string");
        }

        return this._addFilter(field, '$regex', value + '$');
    }

    limit(limit) {
        if (!Utils.isNumber(limit) || limit < 0) {
            throw new Error("Limit must be a positive number");
        }

        this._limit = limit;

        return this;
    }
    skip(skip) {
        if (!Utils.isNumber(skip) || skip < 0 ) {
            throw new Error("Skip must be a positive number");
        }

        this._skip = skip;

        return this;
    }
    page(page) {
        if (!Utils.isNumber(page) || page < 0 ) {
            throw new Error("Page must be a positive number");
        }

        this._skip = (page - 1) * this._limit;

        return this;
    }

    ascending(field) {
        this._sort[field] = 1;

        return this;
    }
    descending(field) {
        this._sort[field] = -1;

        return this;
    }

    or(query) {
        if (!(query instanceof SCQuery)) {
            throw new Error('Invalid type of Query');
        }

        if (!this._filter['$or']) {
            this._filter['$or'] = [];
        }

        this._filter['$or'].push(query.toJson().query);

        return this;

    }
    and(query) {
        if (!(query instanceof SCQuery)) {
            throw new Error('Invalid type of Query');
        }

        if (!this._filter['$and']) {
            this._filter['$and'] = [];
        }

        this._filter['$and'].push(query.toJson().query);

        return this;
    }

    select() {
        this._fields = [];
        let ln = arguments.length;

        for (let i = 0; i < ln; i++) {
            this._fields.push(arguments[i]);
        }

        return this;
    }

    raw(filter) {
        if (!Utils.isObject(filter)) {
            throw new Error('Filter must be a object');
        }
        this._filter = filter;

        return this;
    }

    toJson() {
        const json = {
            coll: this._collection,
            limit: this._limit,
            skip: this._skip,
            query: this._filter,
            sort: this._sort,
            fields: this._fields
        };

        return json;
    }
}