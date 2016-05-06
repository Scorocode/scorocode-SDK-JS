'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
                        return reject(new Error('Invalid statusCode: ' + res.statusCode));
                    }

                    res.on('data', function (data) {
                        result += data.toString();
                    });

                    res.on('error', function (data) {
                        return reject(data);
                    });

                    res.on('end', function () {
                        return resolve(result);
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

            var promise = new Promise(function (resolve, reject) {
                var url = 'https://' + _this2.host + _this2.path;
                var xhr = new XMLHttpRequest();

                xhr.timeout = _this2.timeout;
                xhr.open(_this2.method, url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) return;
                    if (xhr.status != 200) {
                        return reject(new Error('Invalid statusCode: ' + xhr.status));
                    } else {
                        resolve(xhr.responseText);
                    }
                };
                xhr.send(_this2.data);
            });

            return promise;
        }
    }, {
        key: 'request',
        value: function request() {
            if (typeof XMLHttpRequest !== 'undefined') {
                return this.ajax();
            }
            return this.node_request();
        }
    }, {
        key: 'execute',
        value: function execute() {
            return this.request();
        }
    }]);

    return HttpRequest;
}();