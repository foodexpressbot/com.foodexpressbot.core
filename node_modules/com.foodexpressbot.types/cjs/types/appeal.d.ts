import { UserOptions } from './user';
export interface AppealOptions {
    _id?: string;
    id?: string;
    user?: UserOptions;
    userID?: string;
    serverID?: string;
    userAppeal?: string;
    status?: AppealStatus;
    type?: AppealType;
    punishmentInfo?: PunishmentOptions;
    sentAt?: number;
    votes?: UpvoteOptions[];
}
export interface PunishmentOptions {
    punishmentID?: string;
    issuedBy?: string;
    reason?: string;
    issuedAt?: number;
}
export interface UpvoteOptions {
    userID?: string;
    note?: string;
    upvoted?: boolean;
}
export declare enum AppealType {
    DiscordBan = 1,
    UserBlacklist = 2,
    ServerBlacklist = 3
}
export declare enum AppealStatus {
    PENDING = 0,
    ON_HOLD = 1,
    ACCEPTED = 2,
    DENIED = 3
}
//# sourceMappingURL=appeal.d.ts.map