'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpRequest = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observer = require('./observer');

var _observer2 = _interopRequireDefault(_observer);

var _client = require('./client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var https = null;
if (typeof XMLHttpRequest === 'undefined') {
    https = require('https');
}

var HttpRequest = exports.HttpRequest = function () {
    function HttpRequest(options) {
        _classCallCheck(this, HttpRequest);

        this.method = "";
        this.port = "";
        this.path = "";
        this.host = "";
        this.data = "";
        this.headers = {};

        var protocolJson = options.toJson();

        for (var prop in protocolJson) {
            this[prop] = protocolJson[prop];
        }
    }

    _createClass(HttpRequest, [{
        key: 'node_request',
        value: function node_request() {
            var _this = this;

            var promise = new Promise(function (resolve, reject) {
                var request = https.request({
                    method: _this.method,
                    port: _this.port,
                    path: _this.path,
                    host: _this.host,
                    headers: _this.headers
                }, function (res) {
                    var result = "";
                    if (res.statusCode !== 200) {
                        return reject({
                            error: true,
                            errCode: res.statusCode,
                            errMsg: res.responseText || 'Invalid statusCode'
                        });
                    }

                    res.on('data', function (data) {
                        result += data.toString();
                    });

                    res.on('error', function (err) {
                        return reject({
                            error: true,
                            errCode: res.statusCode,
                            errMsg: err.message
                        });
                    });

                    res.on('end', function () {
                        return resolve(result);
                    });
                });

                request.on('aborted', function () {
                    return reject({
                        error: true,
                        errCode: 504,
                        errMsg: 'Request has been aborted by the server'
                    });
                });

                request.on('abort', function () {
                    return reject({
                        error: true,
                        errCode: 418,
                        errMsg: 'Request has been aborted by the client'
                    });
                });

                request.on('error', function (err) {
                    return reject({
                        error: true,
                        errCode: 422,
                        errMsg: err.message
                    });
                });

                request.setTimeout(_this.timeout, function () {
                    request.abort();
                });

                request.write(_this.data);
                request.end();
            });
            return promise;
        }
    }, {
        key: 'ajax',
        value: function ajax() {
            var _this2 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var promise = new Promise(function (resolve, reject) {
                var url = 'https://' + _this2.host + _this2.path;
                var xhr = new XMLHttpRequest();

                xhr.timeout = _this2.timeout;
                xhr.open(_this2.method, url, true);

                for (var prop in _this2.headers) {
                    xhr.setRequestHeader(prop, _this2.headers[prop]);
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) return;
                    if (xhr.status != 200) {
                        return reject(new Error('Invalid statusCode: ' + xhr.status));
                    } else {
                        resolve(xhr.responseText);
                    }
                };
                options.onXHRPrepare && options.onXHRPrepare(xhr);
                xhr.send(_this2.data);
            });

            return promise;
        }
    }, {
        key: 'request',
        value: function request() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (typeof XMLHttpRequest !== 'undefined') {
                return this.ajax(options);
            }
            return this.node_request();
        }
    }, {
        key: 'execute',
        value: function execute() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var client = _client.Client.getInstance();

            var fn = this.request;
            for (var i = 0; i < client.middleware.length; i++) {
                fn = client.middleware[i](fn);
            }

            return fn(options).then(function (data) {
                return JSON.parse(data);
            }).then(function (res) {
                if (res.error) {
                    return Promise.reject(res);
                }

                return Promise.resolve(JSON.stringify(res));
            }).catch(function (err) {
                (0, _observer2.default)().emit('error', err);
                return Promise.reject(err);
            });
        }
    }]);

    return HttpRequest;
}();