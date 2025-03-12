"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const convertString_1 = __importDefault(require("../Util/convertString"));
const DEFAULT_SETTINGS = [
    {
        key: 'teamsEnabled',
        value: false
    },
    {
        key: 'currentAnnouncement',
        value: {
            enabled: false,
            title: 'none',
            content: 'none',
            type: 'info'
        }
    },
    {
        key: 'staffPurge',
        value: {
            enabled: true,
            nextPurgeDate: null,
            lastPurgeDate: null
        }
    },
    {
        key: 'dailySpecial',
        value: {
            item: '',
            lastUpdated: Date.now()
        }
    }
];
/**
 * Controller for the settings
 */
class Settings extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.collection = db.collection('settings');
        this.allowedFields = ['key', 'value'];
        this.initDefaultSettings().catch(console.error);
    }
    isSettingsExist() {
        return new Promise(async (resolve, reject) => {
            try {
                const count = await this.collection.countDocuments({});
                resolve(count !== 0);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    initDefaultSettings() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.collection.bulkWrite(DEFAULT_SETTINGS.map(d => ({
                    updateOne: {
                        filter: {
                            key: d.key
                        },
                        update: {
                            $setOnInsert: {
                                value: d.value
                            },
                        },
                        upsert: true
                    }
                })));
                await this.updateCache();
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getSettingsFromDatabase() {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.collection.find().toArray();
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    updateCache() {
        return new Promise(async (resolve, reject) => {
            try {
                const settings = await this.getSettingsFromDatabase();
                for (const setting of settings) {
                    await this.client.redis.redis.hset('settings', setting.key, (typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value));
                }
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getSetting(key) {
        return new Promise(async (resolve, reject) => {
            try {
                const exists = await this.client.redis.redis.hexists('settings', key);
                if (!exists) {
                    const setting = await this.collection.findOne({ key });
                    if (!setting)
                        return reject({ statusCode: 404, code: 'settings_not_found', message: 'Settings not found.' });
                    return resolve((0, convertString_1.default)(setting?.value));
                }
                const setting = await this.client.redis.redis.hget('settings', key);
                resolve(setting ? (0, convertString_1.default)(setting) : undefined);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getSettingsFromCache() {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.client.redis.redis.hgetall('settings');
                resolve(data);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    modifySetting(key, value) {
        return new Promise(async (resolve, reject) => {
            try {
                // Is this necessary? We could just upsert the value
                if (!await this.isSettingsExist())
                    return reject({ statusCode: 500, code: 'settings_no_exist', message: 'Settings does not exist. Please initialise.' });
                await this.db.collection('settings').updateOne({ key }, {
                    $set: {
                        value
                    }
                }, {
                    upsert: true
                });
                await this.updateCache();
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
}
exports.default = Settings;
//# sourceMappingURL=Settings.js.map