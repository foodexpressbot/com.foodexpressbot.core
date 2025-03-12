import { UserOptions } from './user';
import { BacklogOptions } from './backlog';
export interface ReportOrderOptions {
    _id: string;
    orderID: string;
    reportReason: string;
    notes: string;
    reportedBy: string | UserOptions;
    reportedAt: number;
    orderInfo?: BacklogOptions;
}
//# sourceMappingURL=reports.d.ts.map