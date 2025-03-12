import Controller from '../Structure/Controller';
import { RankOptions } from 'com.foodexpressbot.types/types';
export default class Rank extends Controller {
    allowedFields: string[];
    additionalFields: string[];
    constructor(client: any, db: any);
    cacheRanks(): Promise<RankOptions[]>;
    getRank(filter: string | object, fields?: string[]): Promise<RankOptions>;
    getRanks(filter?: object, fields?: string[]): Promise<RankOptions[]>;
    getRanksFromCache(): Promise<RankOptions[]>;
    getRankFromCache(id: string): Promise<RankOptions | null>;
    formatRanks(rankIDs: string[]): Promise<RankOptions[]>;
    createRank(data: RankOptions): Promise<RankOptions>;
    updateRank(filter: object | string, data: RankOptions): Promise<RankOptions>;
    deleteRank(filter: object | string): Promise<RankOptions>;
    updateRankPositions(ranks: string[]): Promise<void>;
    validatePermissions(permissions: string[]): string[];
}
//# sourceMappingURL=Rank.d.ts.map