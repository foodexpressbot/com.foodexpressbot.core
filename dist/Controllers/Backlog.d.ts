import Controller from '../Structure/Controller';
import { BacklogOptions } from 'com.foodexpressbot.types/types';
export default class Backlog extends Controller {
    constructor(client: any, db: any);
    addToLog(data: BacklogOptions): Promise<object>;
    updateLog(filter: string | object, data: object): Promise<void>;
    findOrder(filter: string | object): Promise<BacklogOptions>;
    findOrdersByUser(userID: string): Promise<BacklogOptions[]>;
    findOrders(filter: object, limit?: number, sort?: object): Promise<BacklogOptions[]>;
    getFeedbackOrders(filter: object, limit?: number, sort?: object): Promise<BacklogOptions[]>;
    getFeedbackOrder(filter: object): Promise<BacklogOptions>;
}
//# sourceMappingURL=Backlog.d.ts.map