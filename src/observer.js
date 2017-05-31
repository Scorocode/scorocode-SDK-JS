var instance;

function Observer () {

    if (instance) {
        return instance;
    }

    if (this && this.constructor === Observer) {
        instance = this;
    } else {
        return new Observer();
    }

}

Observer.prototype._listeners = {};

Observer.prototype.emit = function () {

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
    }

    var e = args.shift();

    if (!this._listeners[e]) {
        return false;
    }

    let ln = this._listeners[e].length;
    for (let i = 0; i < ln; i++) {
        this._listeners[e][i].apply(null, args)
    }

};

Observer.prototype.on = function (e, cb) {

    if (!this._listeners[e]) {
        this._listeners[e] = [];
    }
    this._listeners[e].push(cb);

};

var SCObserver = (function () {

    return Observer;

}());

export default SCObserver;