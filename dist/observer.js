"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var instance;

function constructObserver() {
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

    var ln = this._listeners[e].length;
    for (var _i = 0; _i < ln; _i++) {
        var _ln = this._listeners[e][_i].apply(null, args);
    }
};

constructObserver.prototype.on = function (e, cb) {
    if (!this._listeners[e]) {
        this._listeners[e] = [];
    }
    this._listeners[e].push(cb);
};

var SCObserver = function () {
    return constructObserver;
}();

exports.default = SCObserver;