import {BotProtocol} from './protocol'
import {Utils} from './utils'
import {HttpRequest} from './httpRequest'

export class SCBot {
    constructor(botId) {
        this.botId = botId;
    }

    send(data, callbacks = {}) {
        const protocol = BotProtocol.init(this.botId);
        protocol.setData(data);

        const request = new HttpRequest(protocol);
        const promise = request.execute();
        return Utils.wrapCallbacks(promise, callbacks);
    }
}