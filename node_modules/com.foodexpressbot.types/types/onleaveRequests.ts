import { UserOptions } from './user';

export interface OnLeaveOptions {
    _id: string;
    userID: string;
    startDate: number;
    expiry: number | null;
    reason?: string;
    declineReason?: string;
    status: OnLeaveStatus;
    authorisedBy: string;
    sentAt?: number;

    // Aggregate fields
    user?: UserOptions;
}

export enum OnLeaveStatus {
    PENDING = 0,
    APPROVED = 1,
    DENIED = 2
}
