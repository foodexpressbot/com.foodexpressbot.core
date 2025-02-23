import amqplib, { Connection, Channel, Replies, ConsumeMessage } from 'amqplib';
import EventEmitter from 'node:events';
import AssertQueue = Replies.AssertQueue;

export default class RabbitMQ extends EventEmitter {
    public channelName: string;

    public client: Connection;
    public channel: Channel;

    public api: AssertQueue;
    public gateway: AssertQueue;
    public bot: AssertQueue;

    constructor(channelName: string) {
        super();
        this.channelName = channelName;
        this.client = null;
        this.channel = null;

        this.api = null;
        this.gateway = null;
        this.bot = null;
    }

    public async connect(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                this.client = await amqplib.connect(process.env.RABBITMQ_URI);

                this.channel = await this.client.createChannel();
                this.api = await this.channel.assertQueue('api');
                this.gateway = await this.channel.assertQueue('gateway');
                this.bot = await this.channel.assertQueue('bot');

                // Listen to messages for the current process
                if (this.channelName) {
                    this.listen();
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    private listen() {
        this.channel.consume(this[this.channelName].queue, (msg: ConsumeMessage) => {
            if (!msg) return;
            const data = JSON.parse(msg.content.toString());

            // todo: this is not defined???
            // @ts-ignore
            this.emit(data.event, data.data);
            this.channel.ack(msg);
        });
    }

    public sendToGateway(event: string, data: string | object): boolean {
        return this.channel.sendToQueue(this.gateway.queue, this.getPayload(event, data));
    }

    public sendToAPI(event: string, data: string | object): boolean {
        return this.channel.sendToQueue(this.api.queue, this.getPayload(event, data));
    }

    public sendToBot(event: string, data: string | object): boolean {
        return this.channel.sendToQueue(this.bot.queue, this.getPayload(event, data));
    }

    private getPayload(event: string, data: string | object): Buffer {
        return Buffer.from(JSON.stringify({ event, t: Date.now(), data }));
    }

    public async close() {
        await this.channel.close();
        await this.client.close();
    }
}
