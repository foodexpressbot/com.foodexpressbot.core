export type BaseRequestOption = {
    _id: string;
    requestType: 'backlog' | 'blacklist';
    reason: string;
    requestedBy: string;
    requestedAt: number;
}

export type RequestBacklogOption = {
    orderID: string;
} & BaseRequestOption;

export type RequestBlacklistOption = {
    userID: string;
} & BaseRequestOption;

export type RequestAnyOption = RequestBacklogOption | RequestBlacklistOption;
// export interface RequestBlacklistOption extends BaseRequestOption {
//     backlogID: string;
// }
