export class SCDebugger {
    constructor(opt = {}) {
        this.log = function() {
            console.log.apply(this, arguments);
        };
        this.error = function () {
            console.error.apply(this, arguments);
        }
    }
}