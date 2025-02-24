import Controller from '../Structure/Controller';
import { Redis } from 'ioredis';
<<<<<<< HEAD
import { DeliveryQueueOption } from 'com.foodexpressbot.types/types';
=======
import { DeliveryQueueOption } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)

export default class DeliveryQueue extends Controller {
    public redisKey: string;
    public queue: Redis;
    constructor(client, db) {
        super(client, db);
        this.redisKey = 'deliveryQueue';
        this.queue = this.client.redis.redis;
    }

    public joinQueue(userID: string): Promise<DeliveryQueueOption> {
        return new Promise(async (resolve, reject) => {
            try {
                const queue = { userID, joinedAt: Date.now() };
                await this.queue.hset(this.redisKey, userID, queue.joinedAt);

                this.client.rabbitmq.sendToGateway('joinDeliveryQueue', queue);
                resolve(queue);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public removeFromQueue(userID: string, reason?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {

                await this.queue.hdel(this.redisKey, userID);

                this.client.rabbitmq.sendToGateway('leaveDeliveryQueue', userID);
                resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    public getQueue(): Promise<DeliveryQueueOption[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const queue = await this.queue.hgetall(this.redisKey);
                resolve(Object.entries(queue).map(([userID, joinedAt]) => ({ userID, joinedAt: parseInt(joinedAt) })).sort((a, b) => a.joinedAt - b.joinedAt));
            } catch (e) {
                return reject(e);
            }
        });
    }

    public getNextPersonInQueue(): Promise<DeliveryQueueOption | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const queue = await this.getQueue();
                resolve(queue[0]);
            } catch (e) {
                return reject(e);
            }
        });
    }
}
