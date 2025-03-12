import Controller from '../Structure/Controller';
import { Redis } from 'ioredis';
import { DeliveryQueueOption } from 'com.foodexpressbot.types/types';
export default class DeliveryQueue extends Controller {
    redisKey: string;
    queue: Redis;
    constructor(client: any, db: any);
    joinQueue(userID: string): Promise<DeliveryQueueOption>;
    removeFromQueue(userID: string, reason?: string): Promise<void>;
    getQueue(): Promise<DeliveryQueueOption[]>;
    getNextPersonInQueue(): Promise<DeliveryQueueOption | null>;
}
//# sourceMappingURL=DeliveryQueue.d.ts.map