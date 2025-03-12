import { Connection, Channel, Replies } from 'amqplib';
import EventEmitter from 'node:events';
import AssertQueue = Replies.AssertQueue;
export default class RabbitMQ extends EventEmitter {
    channelName: string;
    client: Connection;
    channel: Channel;
    api: AssertQueue;
    gateway: AssertQueue;
    bot: AssertQueue;
    constructor(channelName: string);
    connect(): Promise<void>;
    private listen;
    sendToGateway(event: string, data: string | object): boolean;
    sendToAPI(event: string, data: string | object): boolean;
    sendToBot(event: string, data: string | object): boolean;
    private getPayload;
    close(): Promise<void>;
}
//# sourceMappingURL=RabbitMQ.d.ts.map