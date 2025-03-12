import { UserOptions } from './user';
export declare enum ObjectiveRewardType {
    VD_CURRENCY = 0,
    VD_PERK = 1,
    VD_RANK = 2,
    CUSTOM = 3
}
export declare enum ObjectiveType {
    ORDER_TARGET_PREPARED = 0,
    ORDER_TARGET_DELIVERED = 1,
    ORDER_TARGET_TOTAL = 2
}
export interface ClaimedObjectiveOptions {
    userID?: string;
    objectiveID?: string;
    timestamp?: number;
}
export interface ObjectiveOptions {
    _id?: string;
    userID: string;
    createdBy?: UserOptions;
    description?: string;
    type?: ObjectiveType;
    target?: number;
    global?: boolean;
    rewardType?: ObjectiveRewardType;
    rewardData?: any;
}
//# sourceMappingURL=objectives.d.ts.map