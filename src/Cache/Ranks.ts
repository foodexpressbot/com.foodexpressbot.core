import { Db } from 'mongodb';
import { Core } from '../Core';
import Cache from '../Structure/Cache';
import Logger from '../Util/Logger';
<<<<<<< HEAD
import {RankOptions} from 'com.foodexpressbot.types/types';
=======
import {RankOptions} from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)

export default class Ranks extends Cache {
    public initComplete: boolean = false;

    constructor(client: Core, db: Db) {
        super(client, db);

        if (client.clientOptions.cache?.autoInit?.includes('ranks')) {
            this.initRanks().catch((e) => Logger.error('[CACHE] Failed to init ranks! Error: ' + e.toString()));
        }
    }

    public initRanks(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const ranks = await this.client.controllers.rank.getRanks();

                if (this.getAll().length >= 1) {
                    this.clear();
                }

                this.bulkSet('_id', ranks);

                // console.log(this.getAll())
                this.initComplete = true;
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    public getHighestRank(rankIDs: string[]): RankOptions | null {
        if (!rankIDs.length) return null;

        const data: RankOptions[] = this.getAll();

        // Find all ranks that are in the list of ranks
        return rankIDs.map((id: string) => data.find((rank: RankOptions) => rank._id === id)).sort((a, b) => (b?.position as number) - (a?.position as number))[0] || null;
    }

    public getRanks(rankIDs: string[]): RankOptions[] {
        const data: RankOptions[] = this.getAll();

        return rankIDs.map((rankID: string) => data.find((rank:  RankOptions) => rank._id === rankID));
    }

}
