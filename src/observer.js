var instance;

function constructObserver () {
    if (instance) {
        return instance;
    }

    if (this && this.constructor === constructObserver) {
        instance = this;
    } else {
        return new constructObserver();
    }
}

constructObserver.prototype._listeners = {};
constructObserver.prototype.emit = function () {

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
        let ln = this._listeners[e][i].apply(null, args)
    }
};

constructObserver.prototype.on = function (e, cb) {
    if (!this._listeners[e]) {
        this._listeners[e] = [];
    }
    this._listeners[e].push(cb);
};

var SCObserver = (function () {
    return constructObserver;
}());

export default SCObserver;