"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const Snowflake_1 = __importDefault(require("../Structure/Snowflake"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
class Rank extends Controller_1.default {
    additionalFields;
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['_id', 'id', 'name', 'description', 'colour', 'permissions', 'perks', 'position', 'staffRank', 'useTeams', 'displayOnTeam', 'logUserRankHistory', 'roleIDs', 'staff', 'orders'];
        this.additionalFields = ['default', 'roleIDs'];
        // this.cacheRanks().catch(console.error);
    }
    cacheRanks() {
        return new Promise(async (resolve, reject) => {
            try {
                const ranks = await this.getRanks();
                // 1 day
                await this.client.redis.cache('ranks', JSON.stringify(ranks), 86400);
                resolve(ranks);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getRank(filter, fields = []) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') {
                    filter = { id: filter };
                }
                const query = await this.db.collection('ranks').aggregate([
                    { $match: { ...filter } },
                    { $project: (0, formatAggregate_1.default)([...this.allowedFields, ...fields], false) }
                ]).toArray();
                resolve(query[0]);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getRanks(filter = {}, fields = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('ranks').aggregate([
                    {
                        $match: filter
                    },
                    {
                        $sort: {
                            position: -1
                        }
                    },
                    {
                        $project: (0, formatAggregate_1.default)([...this.allowedFields, ...fields])
                    }
                ]).toArray();
                resolve(query);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getRanksFromCache() {
        return new Promise(async (resolve, reject) => {
            try {
                const ranks = await this.client.redis.getCache('ranks');
                if (!ranks) {
                    const data = await this.cacheRanks();
                    return resolve(data);
                }
                resolve(JSON.parse(ranks));
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getRankFromCache(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const ranks = await this.getRanksFromCache();
                const rank = ranks.find(r => r.id === id);
                resolve(rank);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    async formatRanks(rankIDs) {
        const ranks = await this.getRanksFromCache();
        const formatted = [];
        for (const rankID of rankIDs) {
            const rank = ranks.find((rank) => rank._id === rankID);
            if (!rank)
                continue;
            formatted.push(rank);
        }
        return formatted.sort((a, b) => b.position - a.position);
    }
    createRank(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const id = await Snowflake_1.default.generate();
                const position = await this.getRanks();
                await this.db.collection('ranks').insertOne({ _id: id, id, position: position.length + 1, ...data });
                const newRank = await this.getRank(id, [...this.allowedFields, ...this.additionalFields]);
                resolve(newRank);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    updateRank(filter, data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { id: filter };
                const rank = await this.getRank(filter, [...this.allowedFields, ...this.additionalFields]);
                if (!rank)
                    return reject({ statusCode: 400, code: 'rank_not_found', message: 'Rank not found' });
                await this.db.collection('ranks').updateOne(filter, { $set: data });
                const newRank = await this.getRank(filter, [...this.allowedFields, ...this.additionalFields]);
                resolve(newRank);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    deleteRank(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { id: filter };
                const rank = await this.getRank(filter);
                if (!rank)
                    return reject({ statusCode: 400, code: 'rank_not_found', message: 'Rank not found' });
                await this.db.collection('users').updateMany({ ranks: rank._id }, { $pull: { ranks: rank._id } });
                await this.db.collection('ranks').deleteOne({ _id: rank._id });
                // Remove anything using the old rank
                resolve(rank);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    updateRankPositions(ranks) {
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
                await this.db.collection('ranks').bulkWrite(updateQuery);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    validatePermissions(permissions) {
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
exports.default = Rank;
//# sourceMappingURL=Rank.js.map