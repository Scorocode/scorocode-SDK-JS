"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SCDebugger = exports.SCDebugger = function SCDebugger() {
    var opt = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SCDebugger);

    this.log = function () {
        console.log.apply(this, arguments);
    };
    this.error = function () {
        console.error.apply(this, arguments);
    };
};