import Controller from '../Structure/Controller';
<<<<<<< HEAD
import { BlacklistOptions } from 'com.foodexpressbot.types/types';
=======
import { BlacklistOptions } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)

export default class Blacklist extends Controller {
    constructor(client, db) {
        super(client, db);
    }

    public addBlacklist(id: string, blacklistedBy: string, type: 'user' | 'server', reason?: string, auto?: boolean): Promise<object> {
        return new Promise(async (resolve, reject) => {
            try {
                // Increase the management blacklist statistics
                if (blacklistedBy && auto !== true) {
                    await this.client.controllers.statistics.incManagementStatistics(blacklistedBy, 'blacklists');
                }
                const query = await this.db.collection<BlacklistOptions>('blacklists').updateOne({ _id: id }, { $set: { blacklistedBy, reason, type, auto: auto === true }, $setOnInsert: { blacklistedAt: Date.now() } }, { upsert: true });
                resolve(query);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public removeBlacklist(id: string): Promise<object> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<BlacklistOptions>('blacklists').deleteOne({ _id: id });
                resolve(query);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public getBlacklist(id: string): Promise<BlacklistOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<BlacklistOptions>('blacklists').findOne({ _id: id });
                resolve(query as unknown as BlacklistOptions);
            } catch (e) {
                reject(e);
            }
        });
    }

    public getBlacklists(filter: object[]): Promise<BlacklistOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<BlacklistOptions>('blacklists').aggregate(filter).toArray();
                resolve(query as BlacklistOptions[]);
            } catch (e) {
                reject(e);
            }
        });
    }
}
