"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const events_1 = require("events");
class Redis extends events_1.EventEmitter {
    redis;
    constructor() {
        super();
        this.redis = new ioredis_1.default(process.env.REDIS_URL);
        this.redis.flushall().catch(console.error);
        this.redis.flushdb().catch(console.error);
    }
    async cache(key, data, expiry) {
        return await this.redis.setex(key, expiry, data);
    }
    async getCache(key) {
        // if (process.env.NODE_ENV === 'DEVELOPMENT') return null;
        return await this.redis.get(key);
    }
}
exports.default = Redis;
//# sourceMappingURL=Redis.js.map