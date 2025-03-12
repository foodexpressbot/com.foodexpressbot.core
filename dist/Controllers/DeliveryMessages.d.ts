import Controller from '../Structure/Controller';
import { ShareDeliveryMessageOptions } from 'com.foodexpressbot.types/types';
export default class DeliveryMessages extends Controller {
    constructor(client: any, db: any);
    createMessage(options: Partial<ShareDeliveryMessageOptions>): Promise<ShareDeliveryMessageOptions>;
    updateMessage(filter: Partial<ShareDeliveryMessageOptions>, options: object): Promise<void>;
    deleteMessage(filter: Partial<ShareDeliveryMessageOptions>): Promise<void>;
    generateSlug(title: string): Promise<string>;
    getDeliveryMessages(filter?: object, options?: {
        sort?: object;
        limit?: number;
        sample?: number;
    }, fields?: string[]): Promise<ShareDeliveryMessageOptions[]>;
    getDeliveryMessage(filter?: object, fields?: string[]): Promise<ShareDeliveryMessageOptions>;
}
//# sourceMappingURL=DeliveryMessages.d.ts.map