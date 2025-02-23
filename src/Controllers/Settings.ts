import Controller from '../Structure/Controller';
import convertString from '../Util/convertString';
import { SettingsValue } from 'com.foodexpressbot.types/types';

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
export default class Settings extends Controller {
    constructor(client, db) {
        super(client, db);

        this.collection = db.collection('settings');
        this.allowedFields = ['key', 'value'];

        this.initDefaultSettings().catch(console.error);
    }

    public isSettingsExist(): Promise<Boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const count = await this.collection.countDocuments({});
                resolve(count !== 0);
            } catch (e) {
                reject(e);
            }
        });
    }

    public initDefaultSettings(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.collection.bulkWrite(
                    DEFAULT_SETTINGS.map(d => ({
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
                    })
                ));

                await this.updateCache();
                resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    public getSettingsFromDatabase(): Promise<SettingsValue[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.collection.find().toArray();
                resolve(query as unknown as SettingsValue[]);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public updateCache(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const settings = await this.getSettingsFromDatabase();

                for (const setting of settings) {
                    await this.client.redis.redis.hset('settings', setting.key, (typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value));
                }

                resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    public getSetting(key: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const exists = await this.client.redis.redis.hexists('settings', key);
                if (!exists) {
                    const setting = await this.collection.findOne<any>({ key });
                    if (!setting) return reject({ statusCode: 404, code: 'settings_not_found', message: 'Settings not found.' });

                    return resolve(convertString(setting?.value));
                }

                const setting = await this.client.redis.redis.hget('settings', key);
                resolve(setting ? convertString(setting) : undefined);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public getSettingsFromCache(): Promise<SettingsValue> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.client.redis.redis.hgetall('settings');
                resolve(data as unknown as SettingsValue);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public modifySetting<T>(key: String, value: T): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // Is this necessary? We could just upsert the value
                if (!await this.isSettingsExist()) return reject({ statusCode: 500, code: 'settings_no_exist', message: 'Settings does not exist. Please initialise.' });
                await this.db.collection('settings').updateOne({ key }, {
                    $set: {
                        value
                    }
                }, {
                    upsert: true
                });

                await this.updateCache();

                resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }
}
