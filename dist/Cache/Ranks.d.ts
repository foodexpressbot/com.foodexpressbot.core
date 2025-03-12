import { Db } from 'mongodb';
import { Core } from '../Core';
import Cache from '../Structure/Cache';
import { RankOptions } from 'com.foodexpressbot.types/types';
export default class Ranks extends Cache {
    initComplete: boolean;
    constructor(client: Core, db: Db);
    initRanks(): Promise<void>;
    getHighestRank(rankIDs: string[]): RankOptions | null;
    getRanks(rankIDs: string[]): RankOptions[];
}
//# sourceMappingURL=Ranks.d.ts.map