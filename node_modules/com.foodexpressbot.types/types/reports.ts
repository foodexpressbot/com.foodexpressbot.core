import { UserOptions } from './user';
import { BacklogOptions } from './backlog';

export interface ReportOrderOptions {
    _id: string;
    orderID: string;
    reportReason: string;
    notes: string;
    reportedBy: string | UserOptions;
    reportedAt: number;

    // Aggregated data
    orderInfo?: BacklogOptions;
}
