import Controller from '../Structure/Controller';
<<<<<<< HEAD
import { RatelimitOptions } from 'com.foodexpressbot.types/types';
=======
import { RatelimitOptions } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)
import { Redis } from 'ioredis';

export default class Ratelimits extends Controller {
    public cache: Redis;
    constructor(client, db) {
        super(client, db);

        this.cache = client.redis.redis;
        // this.collection = db.collection('teams');
        // this.allowedFields = ['name', 'roleID', 'orders', 'createdAt'];
    }

    public async getTimestamps(key: string, windowStart: number, currentTimestamp: number) {
        return this.cache.zrangebyscore(key, windowStart, currentTimestamp);
    }

    public async findTimestamps(key: string) {
        return this.cache.keys(key);
    }

    public async addTimestamp(key: string, currentTimestamp: number) {
        return this.cache.zadd(key, currentTimestamp, currentTimestamp);
    }

    public removeOldTimestamps(key: string, windowStart: number) {
        return this.cache.zremrangebyscore(key, '-inf', windowStart);
    }

    // public addRatelimit(options: RatelimitOptions): Promise<RatelimitOptions> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const exists = await this.getRatelimit(options.ip);
    //
    //             if (exists) {
    //                 options.totalRequests++;
    //             }
    //
    //             this.cache.hset('ratelimits', options.ip, JSON.stringify(options));
    //
    //             resolve(options);
    //         } catch (e) {
    //             return reject(e);
    //         }
    //     });
    // }
    //
    // public async getRatelimit(key: string): Promise<RatelimitOptions | null> {
    //     const entry = await this.cache.get('ratelimits');
    //
    //     if (!entry) return null;
    //
    //     try {
    //         return JSON.parse(entry);
    //     } catch {
    //         return null;
    //     }
    // }
    //
    // private generateKey(ip: string, route?: string) {
    //     return 'ratelimits:' + ip + route;
    // }
}
