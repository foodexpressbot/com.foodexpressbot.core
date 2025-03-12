"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
class DeliveryQueue extends Controller_1.default {
    redisKey;
    queue;
    constructor(client, db) {
        super(client, db);
        this.redisKey = 'deliveryQueue';
        this.queue = this.client.redis.redis;
    }
    joinQueue(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const queue = { userID, joinedAt: Date.now() };
                await this.queue.hset(this.redisKey, userID, queue.joinedAt);
                this.client.rabbitmq.sendToGateway('joinDeliveryQueue', queue);
                resolve(queue);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    removeFromQueue(userID, reason) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.queue.hdel(this.redisKey, userID);
                this.client.rabbitmq.sendToGateway('leaveDeliveryQueue', userID);
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getQueue() {
        return new Promise(async (resolve, reject) => {
            try {
                const queue = await this.queue.hgetall(this.redisKey);
                resolve(Object.entries(queue).map(([userID, joinedAt]) => ({ userID, joinedAt: parseInt(joinedAt) })).sort((a, b) => a.joinedAt - b.joinedAt));
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getNextPersonInQueue() {
        return new Promise(async (resolve, reject) => {
            try {
                const queue = await this.getQueue();
                resolve(queue[0]);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
}
exports.default = DeliveryQueue;
//# sourceMappingURL=DeliveryQueue.js.map