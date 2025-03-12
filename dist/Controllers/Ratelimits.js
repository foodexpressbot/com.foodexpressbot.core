"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
class Ratelimits extends Controller_1.default {
    cache;
    constructor(client, db) {
        super(client, db);
        this.cache = client.redis.redis;
        // this.collection = db.collection('teams');
        // this.allowedFields = ['name', 'roleID', 'orders', 'createdAt'];
    }
    async getTimestamps(key, windowStart, currentTimestamp) {
        return this.cache.zrangebyscore(key, windowStart, currentTimestamp);
    }
    async findTimestamps(key) {
        return this.cache.keys(key);
    }
    async addTimestamp(key, currentTimestamp) {
        return this.cache.zadd(key, currentTimestamp, currentTimestamp);
    }
    removeOldTimestamps(key, windowStart) {
        return this.cache.zremrangebyscore(key, '-inf', windowStart);
    }
}
exports.default = Ratelimits;
//# sourceMappingURL=Ratelimits.js.map