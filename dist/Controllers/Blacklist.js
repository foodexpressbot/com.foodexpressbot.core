"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
class Blacklist extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
    }
    addBlacklist(id, blacklistedBy, type, reason, auto) {
        return new Promise(async (resolve, reject) => {
            try {
                // Increase the management blacklist statistics
                if (blacklistedBy && auto !== true) {
                    await this.client.controllers.statistics.incManagementStatistics(blacklistedBy, 'blacklists');
                }
                const query = await this.db.collection('blacklists').updateOne({ _id: id }, { $set: { blacklistedBy, reason, type, auto: auto === true }, $setOnInsert: { blacklistedAt: Date.now() } }, { upsert: true });
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    removeBlacklist(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('blacklists').deleteOne({ _id: id });
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getBlacklist(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('blacklists').findOne({ _id: id });
                resolve(query);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getBlacklists(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('blacklists').aggregate(filter).toArray();
                resolve(query);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = Blacklist;
//# sourceMappingURL=Blacklist.js.map