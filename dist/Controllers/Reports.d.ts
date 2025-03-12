import { ReportOrderOptions } from 'com.foodexpressbot.types/types';
import Controller from '../Structure/Controller';
export default class ReportsController extends Controller {
    constructor(client: any, db: any);
    createOrderReport(report: Partial<ReportOrderOptions>): Promise<ReportOrderOptions>;
    deleteOrderReport(filter: object): Promise<void>;
    getOrderReport(filter: object): Promise<ReportOrderOptions | null>;
    getOrderReports(filter: object, sort?: object | null, limit?: number): Promise<ReportOrderOptions[]>;
}
//# sourceMappingURL=Reports.d.ts.map