import {Utils} from "./utils"

var operators = {
    set: function (key, value) {
        if (this instanceof SCUpdateOps || this.attrs['_id']) {
            if (key === 'createdAt' || key === 'updatedAt' || key === '_id') {
                return this;
            }
            if (!this.update['$set']) {
                this.update['$set'] = {}
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
    push: function (key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }
        
        if (!this.update['$push']) {
            this.update['$push'] = {}
        }
        this.update['$push'][key] = value;

        return this;
    },
    pull: function (key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }
        }

        if (!this.update['$pull']) {
            this.update['$pull'] = {}
        }
        this.update['$pull'][key] = value;

        return this;
    },
    pullAll: function (key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }
        }

        if (!Utils.isArray(value)) {
            throw new Error('Value must by a type of array');
        }

        if (!this.update['$pullAll']) {
            this.update['$pullAll'] = {}
        }
        this.update['$pullAll'][key] = value;

        return this;
    },
    addToSet: function (key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }
        }

        if (!this.update['$addToSet']) {
            this.update['$addToSet'] = {}
        }
        this.update['$addToSet'][key] = value;

        return this;
    },
    pop: function (key, pos) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!Utils.isArray(this.attrs[key])) {
                throw new Error('Field must by a type of array');
            }
        }

        if (pos !== 1 && pos !== -1) {
            throw new Error('Position must be 1 or -1');
        }

        if (!this.update['$pop']) {
            this.update['$pop'] = {}
        }
        this.update['$pop'][key] = pos;

        return this;
    },
    inc: function (key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }
        }

        if (!this.update['$inc']) {
            this.update['$inc'] = {}
        }
        this.update['$inc'][key] = value;

        return this;
    },
    currentDate: function (key, type) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (type !== true && type !== 'timestamp' && type !== 'date') {
                throw new Error('Invalid type');
            }
        }

        if (!this.update['$currentDate']) {
            this.update['$currentDate'] = {}
        }

        if (type === 'timestamp' || type === 'date') {
            this.update['$currentDate'][key] = {$type: type};
        } else {
            this.update['$currentDate'][key] = type;
        }


        return this;
    },
    mul: function (key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$mul']) {
            this.update['$mul'] = {}
        }

        this.update['$mul'][key] = value;

        return this;
    },
    min: function (key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$min']) {
            this.update['$min'] = {}
        }

        this.update['$min'][key] = value;

        return this;
    },
    max: function (key, value) {
        if (!(this instanceof SCUpdateOps)) {
            if (!this.attrs['_id']) {
                throw new Error('For a new document use the method Set');
            }

            if (!Utils.isNumber(this.attrs[key])) {
                throw new Error('Field must by a type of number');
            }
        }

        if (!Utils.isNumber(value)) {
            throw new Error('Value must by a type of number');
        }

        if (!this.update['$max']) {
            this.update['$max'] = {}
        }

        this.update['$max'][key] = value;

        return this;
    }
};



class SCUpdateOps {
    constructor() {
        this.update = {};
        for (let prop in operators) {
            this[prop] = operators[prop];
        }
    }
    
    toJson() {
        const json = this.update;
        return json;
    }
}



export {operators, SCUpdateOps}