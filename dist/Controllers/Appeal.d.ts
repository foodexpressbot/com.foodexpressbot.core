import Controller from '../Structure/Controller';
import { AppealOptions, AppealType } from 'com.foodexpressbot.types/types';
export default class Appeal extends Controller {
    allowedFields: string[];
    constructor(client: any, db: any);
    createAppeal(userID: string, type: AppealType, serverID: string | null, userAppeal: string): Promise<AppealOptions>;
    getUserAppeals(filter: object | string, limit?: number, includeVotes?: boolean, detailedVotes?: boolean): Promise<AppealOptions[]>;
    getUserAppeal(filter: object | string, includeVotes?: boolean, detailVotes?: boolean): Promise<AppealOptions | null>;
    voteAppeal(appealID: string, userID: string, vote: 'upvote' | 'downvote', note?: string, force?: boolean): Promise<true | false | null>;
    private acceptOrDenyAppeal;
    private generateAggregationFields;
}
//# sourceMappingURL=Appeal.d.ts.map