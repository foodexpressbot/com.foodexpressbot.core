"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const node_events_1 = __importDefault(require("node:events"));
class RabbitMQ extends node_events_1.default {
    channelName;
    client;
    channel;
    api;
    gateway;
    bot;
    constructor(channelName) {
        super();
        this.channelName = channelName;
        this.client = null;
        this.channel = null;
        this.api = null;
        this.gateway = null;
        this.bot = null;
    }
    async connect() {
        return new Promise(async (resolve, reject) => {
            try {
                this.client = await amqplib_1.default.connect(process.env.RABBITMQ_URI);
                this.channel = await this.client.createChannel();
                this.api = await this.channel.assertQueue('api');
                this.gateway = await this.channel.assertQueue('gateway');
                this.bot = await this.channel.assertQueue('bot');
                // Listen to messages for the current process
                if (this.channelName) {
                    this.listen();
                }
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    listen() {
        this.channel.consume(this[this.channelName].queue, (msg) => {
            if (!msg)
                return;
            const data = JSON.parse(msg.content.toString());
            // todo: this is not defined???
            // @ts-ignore
            this.emit(data.event, data.data);
            this.channel.ack(msg);
        });
    }
    sendToGateway(event, data) {
        return this.channel.sendToQueue(this.gateway.queue, this.getPayload(event, data));
    }
    sendToAPI(event, data) {
        return this.channel.sendToQueue(this.api.queue, this.getPayload(event, data));
    }
    sendToBot(event, data) {
        return this.channel.sendToQueue(this.bot.queue, this.getPayload(event, data));
    }
    getPayload(event, data) {
        return Buffer.from(JSON.stringify({ event, t: Date.now(), data }));
    }
    async close() {
        await this.channel.close();
        await this.client.close();
    }
}
exports.default = RabbitMQ;
//# sourceMappingURL=RabbitMQ.js.map