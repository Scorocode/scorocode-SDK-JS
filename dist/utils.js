'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Utils = {};
Utils.isNumber = function (obj) {
    return toString.call(obj) === '[object Number]';
};
Utils.isObject = function (obj) {
    var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
    return type === 'function' || type === 'object' && !!obj;
};
Utils.isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};
Utils.wrapCallbacks = function (promise) {
    var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return promise.then(function (data) {
        if (callbacks.success) {
            callbacks.success(data);
        }
        return data;
    }).catch(function (error) {
        if (callbacks.error) {
            callbacks.error(error);
        }
        return Promise.reject(error);
    });
};
Utils.extend = function (parent, child) {
    for (var prop in child) {
        parent[prop] = child[prop];
    }
};
Utils.removeElement = function (array, el) {
    var arr = array.filter(function (item) {
        if (el !== item) {
            return el;
        }
    });

    return arr;
};

exports.Utils = Utils;