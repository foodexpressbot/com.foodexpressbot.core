import Controller from '../Structure/Controller';
import Snowflake from '../Structure/Snowflake';
import formatAggregate from '../Util/formatAggregate';
import { RankOptions, UserOptions, KnowledgeBaseOptions, KnowledgeBaseCategoryOptions } from 'com.foodexpressbot.types/types';

export default class Rank extends Controller {
    declare public allowedFields: string[];
    public additionalFields: string[];
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['_id', 'id', 'name', 'description', 'colour', 'permissions', 'perks', 'position', 'staffRank', 'useTeams', 'displayOnTeam', 'logUserRankHistory', 'roleIDs', 'staff', 'orders'];
        this.additionalFields = ['default', 'roleIDs'];
        // this.cacheRanks().catch(console.error);
    }

    public cacheRanks(): Promise<RankOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const ranks = await this.getRanks();
                // 1 day
                await this.client.redis.cache('ranks', JSON.stringify(ranks), 86400);
                resolve(ranks);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getRank(filter: string | object, fields: string[] = []): Promise<RankOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') {
                    filter = { id: filter };
                }
                const query = await this.db.collection<RankOptions>('ranks').aggregate([
                    { $match: { ...filter } },
                    { $project: formatAggregate([...this.allowedFields, ...fields], false) }
                ]).toArray();
                resolve(query[0]);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getRanks(filter: object = {}, fields: string[] = []): Promise<RankOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<RankOptions>('ranks').aggregate([
                    {
                        $match: filter
                    },
                    {
                        $sort: {
                            position: -1
                        }
                    },
                    {
                        $project: formatAggregate([...this.allowedFields, ...fields])
                    }
                ]).toArray();
                resolve(query);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getRanksFromCache(): Promise<RankOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const ranks = await this.client.redis.getCache('ranks');
                if (!ranks) {
                    const data = await this.cacheRanks();
                    return resolve(data);
                }
                resolve(JSON.parse(ranks));
            } catch (e) {

                reject(e);
            }
        });
    }

    public getRankFromCache(id: string): Promise<RankOptions | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const ranks = await this.getRanksFromCache();
                const rank = ranks.find(r => r.id === id);
                resolve(rank);
            } catch (e) {

                reject(e);
            }
        });
    }

    public async formatRanks(rankIDs: string[]): Promise<RankOptions[]> {
        const ranks = await this.getRanksFromCache();
        const formatted = [];

        for (const rankID of rankIDs) {
            const rank = ranks.find((rank: RankOptions) => rank._id === rankID);
            if (!rank) continue;
            formatted.push(rank);
        }

        return formatted.sort((a, b) => b.position - a.position) as RankOptions[];
    }

    public createRank(data: RankOptions): Promise<RankOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const id = await Snowflake.generate();
                const position = await this.getRanks();
                await this.db.collection<RankOptions>('ranks').insertOne({ _id: id, id, position: position.length + 1, ...data });
                const newRank = await this.getRank(id, [...this.allowedFields, ...this.additionalFields]);
                resolve(newRank);
            } catch (e) {

                reject(e);
            }
        });
    }

    public updateRank(filter: object | string, data: RankOptions): Promise<RankOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { id: filter };
                const rank = await this.getRank(filter, [...this.allowedFields, ...this.additionalFields]);
                if (!rank) return reject({ statusCode: 400, code: 'rank_not_found', message: 'Rank not found' });
                await this.db.collection<RankOptions>('ranks').updateOne(filter, { $set: data });
                const newRank = await this.getRank(filter, [...this.allowedFields, ...this.additionalFields]);
                resolve(newRank);
            } catch (e) {

                reject(e);
            }
        });
    }

    public deleteRank(filter: object | string): Promise<RankOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { id: filter };
                const rank = await this.getRank(filter);
                if (!rank) return reject({ statusCode: 400, code: 'rank_not_found', message: 'Rank not found' });

                await this.db.collection<UserOptions>('users').updateMany({ ranks: rank._id }, { $pull: { ranks: rank._id } });
                await this.db.collection<RankOptions>('ranks').deleteOne({ _id: rank._id });

                // Remove anything using the old rank


                resolve(rank);
            } catch (e) {

                reject(e);
            }
        });
    }

    public updateRankPositions(ranks: string[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                let updateQuery = [];

                for (const rankID of ranks.reverse()) {
                    updateQuery.push({
                        updateOne: {
                            filter: {
                                _id: rankID
                            },
                            update: {
                                $set: {
                                    position: ranks.indexOf(rankID) + 1
                                }
                            }
                        }
                    });
                }

                await this.db.collection<RankOptions>('ranks').bulkWrite(updateQuery);

                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public validatePermissions(permissions: string[]): string[] {
        const perms = Object.values(Permissions);
        const valid = [];
        for (const permission of permissions) {
            // @ts-ignore
            if (perms.includes(permission)) {
                valid.push(permission);
            }
        }
        return valid;
    }
}


