import Client, { Redis as RedisClient, } from 'ioredis';
import { EventEmitter } from 'events';

export default class Redis extends EventEmitter {
    public redis: RedisClient;
    constructor() {
        super();

        this.redis = new Client(process.env.REDIS_URL);
        this.redis.flushall().catch(console.error);
        this.redis.flushdb().catch(console.error);
    }

    public async cache(key: string, data: any, expiry: number): Promise<any> {
        return await this.redis.setex(key, expiry, data);
    }

    public async getCache(key: string): Promise<any> {
        // if (process.env.NODE_ENV === 'DEVELOPMENT') return null;
        return await this.redis.get(key);
    }
}
