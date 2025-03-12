import Controller from '../Structure/Controller';
import { ManagementStatisticOptions } from 'com.foodexpressbot.types/types';
export default class StatisticsController extends Controller {
    constructor(client: any, db: any);
    getManagementStatistics(userID: string): Promise<ManagementStatisticOptions | null>;
    deleteManagementStatistics(userID: string): Promise<void>;
    listManagementStatistics(filter?: object, limit?: number, sort?: object): Promise<ManagementStatisticOptions[]>;
    incManagementStatistics(userID: string, statistic: string): Promise<void>;
}
//# sourceMappingURL=Statistics.d.ts.map