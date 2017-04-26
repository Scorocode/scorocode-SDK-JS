'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SCUser = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _protocol = require('./protocol');

var _httpRequest = require('./httpRequest');

var _utils = require('./utils');

var _client = require('./client');

var _object = require('./object');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SCUser = exports.SCUser = function (_SCObject) {
    _inherits(SCUser, _SCObject);

    function SCUser(user) {
        _classCallCheck(this, SCUser);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SCUser).call(this, 'users', user));
    }

    _createClass(SCUser, [{
        key: 'signup',
        value: function signup() {
            var _this2 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.SIGN_UP_URL
            };

            var data = {
                username: this.attrs.username,
                email: this.attrs.email,
                password: this.attrs.password
            };
            var protocol = _protocol.UserProtocol.init(data, this.attrs, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (response) {
                return JSON.parse(response);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                _utils.Utils.extend(_this2.attrs, response.result);

                return response.result;
            });
            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'logout',
        value: function logout() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.LOGOUT_URL
            };

            var protocol = _protocol.UserProtocol.init(null, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (response) {
                return JSON.parse(response);
            }).then(function (response) {
                if (!response.error) {
                    var client = _client.Client.getInstance();
                    client.sessionId = "";
                }

                return response;
            });
            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'authorize',
        value: function authorize() {
            var _this3 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var protocolOpts = {
                url: _client.SDKOptions.GET_AUTH_URL
            };

            var protocol = _protocol.UserProtocol.init(null, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var client = _client.Client.getInstance();
                client.sessionId = response.result.sessionId;

                _utils.Utils.extend(_this3.attrs, response.result.user);

                return response.result.user;
            });
            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }, {
        key: 'login',
        value: function login(email, password) {
            var _this4 = this;

            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var protocolOpts = {
                url: _client.SDKOptions.LOGIN_URL
            };

            var protocol = _protocol.UserProtocol.init({ email: email, password: password }, null, protocolOpts);
            var request = new _httpRequest.HttpRequest(protocol);
            var promise = request.execute().then(function (data) {
                return JSON.parse(data);
            }).then(function (response) {
                if (response.error) {
                    return Promise.reject(response);
                }

                var client = _client.Client.getInstance();
                client.sessionId = response.result.sessionId;

                _utils.Utils.extend(_this4.attrs, response.result.user);

                return response.result.user;
            });

            return _utils.Utils.wrapCallbacks(promise, options);
        }
    }]);

    return SCUser;
}(_object.SCObject);