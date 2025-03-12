import Controller from '../Structure/Controller';
import { OnLeaveOptions, OnLeaveStatus } from 'com.foodexpressbot.types/types';
export default class OnLeaveController extends Controller {
    constructor(client: any, db: any);
    createRequest(userID: string | object, data: Partial<OnLeaveOptions>, logToDiscord?: boolean): Promise<void>;
    getRequest(filter: string | object): Promise<OnLeaveOptions | null>;
    getRequests(filter?: object, sort?: object | null, limit?: number | null): Promise<OnLeaveOptions[]>;
    updateRequestStatus(filter: string | object, status: OnLeaveStatus, authorisedBy: string, declineReason?: string): Promise<OnLeaveOptions>;
    deleteRequest(filter: string | object): Promise<void>;
    getActiveRequests(userID?: string): Promise<OnLeaveOptions[]>;
}
//# sourceMappingURL=OnLeave.d.ts.map