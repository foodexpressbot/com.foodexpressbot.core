import { Redis as RedisClient } from 'ioredis';
import { EventEmitter } from 'events';
export default class Redis extends EventEmitter {
    redis: RedisClient;
    constructor();
    cache(key: string, data: any, expiry: number): Promise<any>;
    getCache(key: string): Promise<any>;
}
//# sourceMappingURL=Redis.d.ts.map