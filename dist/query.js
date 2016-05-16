"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCQuery = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("./utils");

var _data = require("./stores/data");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCQuery = function () {
    function SCQuery(collName) {
        _classCallCheck(this, SCQuery);

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

    _createClass(SCQuery, [{
        key: "_addFilter",
        value: function _addFilter(field, condition, values) {
            if (!_utils.Utils.isObject(this._filter[field])) {
                this._filter[field] = {};
            }

            this._filter[field][condition] = values;
            return this;
        }
    }, {
        key: "find",
        value: function find() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return _data.DataStore.getInstance().find(this.toJson(), options);
        }
    }, {
        key: "count",
        value: function count() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return _data.DataStore.getInstance().count(this.toJson(), options);
        }
    }, {
        key: "update",
        value: function update(object) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return _data.DataStore.getInstance().update(this.toJson(), object.toJson(), options);
        }
    }, {
        key: "remove",
        value: function remove() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return _data.DataStore.getInstance().remove(this.toJson(), options);
        }
    }, {
        key: "reset",
        value: function reset() {
            this._filter = {};
            this.fields = [];

            return this;
        }
    }, {
        key: "equalTo",
        value: function equalTo(field, value) {
            this._filter[field] = value;
            return this;
        }
    }, {
        key: "notEqualTo",
        value: function notEqualTo(field, value) {
            return this._addFilter(field, "$ne", value);
        }
    }, {
        key: "containedIn",
        value: function containedIn(field, value) {
            if (!_utils.Utils.isArray(value)) {
                throw new Error('Value must be of type: Array');
            }

            return this._addFilter(field, '$in', value);
        }
    }, {
        key: "containsAll",
        value: function containsAll(field, value) {
            if (!_utils.Utils.isArray(value)) {
                throw new Error('Value must be of type: Array');
            }

            return this._addFilter(field, '$all', value);
        }
    }, {
        key: "notContainedIn",
        value: function notContainedIn(field, value) {
            if (!_utils.Utils.isArray(value)) {
                throw new Error('Value must be of type: Array');
            }

            return this._addFilter(field, '$nin', value);
        }
    }, {
        key: "greaterThan",
        value: function greaterThan(field, value) {
            return this._addFilter(field, '$gt', value);
        }
    }, {
        key: "greaterThanOrEqualTo",
        value: function greaterThanOrEqualTo(field, value) {
            return this._addFilter(field, '$gte', value);
        }
    }, {
        key: "lessThan",
        value: function lessThan(field, value) {
            return this._addFilter(field, '$lt', value);
        }
    }, {
        key: "lessThanOrEqualTo",
        value: function lessThanOrEqualTo(field, value) {
            return this._addFilter(field, '$lte', value);
        }
    }, {
        key: "exists",
        value: function exists(field) {
            return this._addFilter(field, '$exists', true);
        }
    }, {
        key: "doesNotExist",
        value: function doesNotExist(field) {
            return this._addFilter(field, '$exists', false);
        }
    }, {
        key: "contains",
        value: function contains(field, value) {
            if (!_utils.Utils.isArray(value)) {
                throw new Error('Value must be of type: Array');
            }

            return this._addFilter(field, '$reqex', value);
        }
    }, {
        key: "startsWith",
        value: function startsWith(field, value) {
            if (typeof value !== 'string') {
                throw new Error("Value must be a string");
            }

            return this._addFilter(field, '$regex', '^' + value);
        }
    }, {
        key: "endsWith",
        value: function endsWith(field, value) {
            if (typeof value !== 'string') {
                throw new Error("Value must be a string");
            }

            return this._addFilter(field, '$regex', value + '$');
        }
    }, {
        key: "limit",
        value: function limit(_limit) {
            if (!_utils.Utils.isNumber(_limit) || _limit < 0) {
                throw new Error("Limit must be a positive number");
            }

            this._limit = _limit;

            return this;
        }
    }, {
        key: "skip",
        value: function skip(_skip) {
            if (!_utils.Utils.isNumber(_skip) || _skip < 0) {
                throw new Error("Skip must be a positive number");
            }

            this._skip = _skip;

            return this;
        }
    }, {
        key: "page",
        value: function page(_page) {
            if (!_utils.Utils.isNumber(_page) || _page < 0) {
                throw new Error("Page must be a positive number");
            }

            this._skip = (_page - 1) * this._limit;

            return this;
        }
    }, {
        key: "ascending",
        value: function ascending(field) {
            this._sort[field] = 1;

            return this;
        }
    }, {
        key: "descending",
        value: function descending(field) {
            this._sort[field] = -1;

            return this;
        }
    }, {
        key: "or",
        value: function or(query) {
            if (!(query instanceof SCQuery)) {
                throw new Error('Invalid type of Query');
            }

            if (!this._filter['$or']) {
                this._filter['$or'] = [];
            }

            this._filter['$or'].push(query.toJson().query);

            return this;
        }
    }, {
        key: "and",
        value: function and(query) {
            if (!(query instanceof SCQuery)) {
                throw new Error('Invalid type of Query');
            }

            if (!this._filter['$and']) {
                this._filter['$and'] = [];
            }

            this._filter['$and'].push(query.toJson().query);

            return this;
        }
    }, {
        key: "select",
        value: function select() {
            this._fields = [];
            var ln = arguments.length;

            for (var i = 0; i < ln; i++) {
                this._fields.push(arguments[i]);
            }

            return this;
        }
    }, {
        key: "raw",
        value: function raw(filter) {
            if (!_utils.Utils.isObject(filter)) {
                throw new Error('Filter must be a object');
            }
            this._filter = filter;

            return this;
        }
    }, {
        key: "toJson",
        value: function toJson() {
            var json = {
                coll: this._collection,
                limit: this._limit,
                skip: this._skip,
                query: this._filter,
                sort: this._sort,
                fields: this._fields
            };

            return json;
        }
    }]);

    return SCQuery;
}();

exports.SCQuery = SCQuery;