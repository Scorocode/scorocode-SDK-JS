'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networkStore = require('./networkStore');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataStore = exports.DataStore = function () {
    function DataStore() {
        _classCallCheck(this, DataStore);
    }

    _createClass(DataStore, null, [{
        key: 'getInstance',
        value: function getInstance(type) {
            var store = void 0;
            switch (type) {
                default:
                    store = new _networkStore.Network();
            }
            return store;
        }
    }]);

    return DataStore;
}();