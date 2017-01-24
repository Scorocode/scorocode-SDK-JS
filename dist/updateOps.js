'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCUpdateOps = exports.operators = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var operators = {
    set: function set(key, value) {
        if (this instanceof SCUpdateOps || this.attrs['_id']) {
            if (key === 'createdAt' || key === 'updatedAt' || key === '_id') {
                return this;
            }
            if (!this.update['$set']) {
                this.update['$set'] = {};
            }
            this.update['$set'][key] = value;

            if (this.attrs) {
                this.attrs[key] = value;
            }
        } else {
            this.attrs[key] = value;
        }

        return this;
    },
    push: function push(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }

        if (!this.update['$push']) {
            this.update['$push'] = {};
        }
        this.update['$push'][key] = value;

        return this;
    },
    pull: function pull(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }

        if (!this.update['$pull']) {
            this.update['$pull'] = {};
        }
        this.update['$pull'][key] = value;

        return this;
    },
    pullAll: function pullAll(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }

        if (!_utils.Utils.isArray(value)) {
            throw new Error('Value must by a type of array');
        }

        if (!this.update['$pullAll']) {
            this.update['$pullAll'] = {};
        }
        this.update['$pullAll'][key] = value;

        return this;
    },
    addToSet: function addToSet(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }

        if (!this.update['$addToSet']) {
            this.update['$addToSet'] = {};
        }
        this.update['$addToSet'][key] = value;

        return this;
    },
    pop: function pop(key, pos) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }

        if (pos !== 1 && pos !== -1) {
            throw new Error('Position must be 1 or -1');
        }

        if (!this.update['$pop']) {
            this.update['$pop'] = {};
        }
        this.update['$pop'][key] = pos;

        return this;
    },
    inc: function inc(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!this.update['$inc']) {
            this.update['$inc'] = {};
        }
        this.update['$inc'][key] = value;

        return this;
    },
    currentDate: function currentDate(key, type) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (type !== true && type !== 'timestamp' && type !== 'date') {
                throw new Error('Invalid type');
            }
        }

        if (!this.update['$currentDate']) {
            this.update['$currentDate'] = {};
        }

        if (type === 'timestamp' || type === 'date') {
            this.update['$currentDate'][key] = { $type: type };
        } else {
            this.update['$currentDate'][key] = type;
        }

        return this;
    },
    mul: function mul(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!_utils.Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$mul']) {
            this.update['$mul'] = {};
        }

        this.update['$mul'][key] = value;

        return this;
    },
    min: function min(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!_utils.Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$min']) {
            this.update['$min'] = {};
        }

        this.update['$min'][key] = value;

        return this;
    },
    max: function max(key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!_utils.Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!_utils.Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$max']) {
            this.update['$max'] = {};
        }

        this.update['$max'][key] = value;

        return this;
    }
};

var SCUpdateOps = function () {
    function SCUpdateOps() {
        _classCallCheck(this, SCUpdateOps);

        this.update = {};
        for (var prop in operators) {
            this[prop] = operators[prop];
        }
    }

    _createClass(SCUpdateOps, [{
        key: 'toJson',
        value: function toJson() {
            var json = this.update;
            return json;
        }
    }]);

    return SCUpdateOps;
}();

exports.operators = operators;
exports.SCUpdateOps = SCUpdateOps;