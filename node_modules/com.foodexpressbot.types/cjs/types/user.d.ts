import { RankOptions } from './rank';
export interface UserOptions {
    _id?: string;
    id?: string;
    username?: string;
    displayName?: string;
    discriminator?: string;
    avatar?: string | null;
    premiumType?: number;
    discordFlags?: number;
    flags?: number;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    ranks?: string[];
    subscriptions?: string[];
    team?: string;
    money?: number;
    birthday?: number;
    staffApplications?: {
        nextApplicationAllowed?: number;
        hiredAt?: number;
        applications?: [];
    };
    appeals?: {
        nextAppealAllowed?: number;
        appeals?: [];
    };
    ban?: BanOptions;
    information?: {
        biography?: string;
        favFood?: string;
        pronouns?: string[];
        timezone?: string;
    };
    settings?: {
        inGuild?: boolean;
        nextSyncAllowed?: number;
        hideProfile?: boolean;
        showBirthdayPublicly?: boolean;
        orders?: {
            prepareConfirmation?: boolean;
        };
        deliveryMessage?: {
            disabled?: boolean;
            message?: string;
            chefMessage?: string;
        };
    };
    statistics?: {
        nextDailyRun?: number;
        nextHourlyRun?: number;
        orders?: {
            totalOrders?: number;
            weeklyOrders?: number;
        };
    };
    permissions?: number;
    perks?: string[];
    lastUpdated?: number;
}
export interface BanOptions {
    _id?: string;
    reason?: string | null;
    expiry?: number | null;
    bannedBy?: string;
    bannedAt?: number;
}
export declare enum PerkTypes {
    PriorityOrders = "PRIORITY_ORDERS",
    CancelOrders = "CANCEL_ORDERS",
    OrderMultiplier = "ORDER_MULTIPLIER",
    MultipleVanityUrls = "MULTIPLE_VANITY_URLS",
    FasterOrder = "PREPARE_ORDER_FASTER",
    DailyMultiplier = "DAILY_MULTIPLIER",
    Daily12HourInterval = "DAILY_12_HOUR_INTERVAL",
    DeliveryMessageBeta = "DELIVERY_MESSAGE_BETA",
    FeedbackBeta = "FEEDBACK_BETA",
    FindImagesBeta = "FIND_IMAGES_BETA"
}
export declare enum UserFlags {
    BETA = 1
}
export interface RankHistoryOptions {
    _id?: string;
    userID?: string;
    oldRank?: string | RankOptions | null;
    newRank?: string | RankOptions | null;
    timestamp?: number;
}
//# sourceMappingURL=user.d.ts.map