var Utils = {};
Utils.isNumber = function (obj) {
    return toString.call(obj) === '[object Number]';
};
Utils.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};
Utils.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
};
Utils.wrapCallbacks = function (promise, callbacks = {}) {
    return promise.then(data => {
        if (callbacks.success) {
            callbacks.success(data);
        }
        return data;
    }).catch(error => {
        if (callbacks.error) {
            callbacks.error(error);
        }
        return Promise.reject(error)
    });
};
Utils.extend = function (parent, child) {
    for (let prop in child) {
        parent[prop] = child[prop];
    }
};
Utils.removeElement = function (array, el) {
    let arr = array.filter((item) => {
        if (el !== item) {
            return el
        }
    });
    
    return arr;
};


export {Utils}