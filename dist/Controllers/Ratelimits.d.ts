import Controller from '../Structure/Controller';
import { Redis } from 'ioredis';
export default class Ratelimits extends Controller {
    cache: Redis;
    constructor(client: any, db: any);
    getTimestamps(key: string, windowStart: number, currentTimestamp: number): Promise<string[]>;
    findTimestamps(key: string): Promise<string[]>;
    addTimestamp(key: string, currentTimestamp: number): Promise<number>;
    removeOldTimestamps(key: string, windowStart: number): Promise<number>;
}
//# sourceMappingURL=Ratelimits.d.ts.map