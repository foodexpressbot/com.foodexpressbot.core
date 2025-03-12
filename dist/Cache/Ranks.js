"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cache_1 = __importDefault(require("../Structure/Cache"));
const Logger_1 = __importDefault(require("../Util/Logger"));
class Ranks extends Cache_1.default {
    initComplete = false;
    constructor(client, db) {
        super(client, db);
        if (client.clientOptions.cache?.autoInit?.includes('ranks')) {
            this.initRanks().catch((e) => Logger_1.default.error('[CACHE] Failed to init ranks! Error: ' + e.toString()));
        }
    }
    initRanks() {
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
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getHighestRank(rankIDs) {
        if (!rankIDs.length)
            return null;
        const data = this.getAll();
        // Find all ranks that are in the list of ranks
        return rankIDs.map((id) => data.find((rank) => rank._id === id)).sort((a, b) => b?.position - a?.position)[0] || null;
    }
    getRanks(rankIDs) {
        const data = this.getAll();
        return rankIDs.map((rankID) => data.find((rank) => rank._id === rankID));
    }
}
exports.default = Ranks;
//# sourceMappingURL=Ranks.js.map