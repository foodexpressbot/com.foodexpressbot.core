import { UserOptions } from './user';

export interface ManagementStatisticOptions {
    _id: string;
    appealsUpvoted?: number[];
    blacklists?: number[];
    backlogs?: number[]
    warnings?: number[];
    applications?: number[];
    // Aggregated data
    user?: UserOptions;
}
