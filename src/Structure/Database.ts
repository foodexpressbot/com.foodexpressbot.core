import { MongoClient, Db } from 'mongodb';

export default class Database {
    url: string;
    database: string;
    db: Db;
    constructor(url, database) {
        this.url = url;
        this.database = database;
        this.db = null;
    }

    // public connect(): Promise<Db> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             this.db = (await MongoClient.connect(this.url, { keepAlive: true, connectTimeoutMS: 30000 })).db(this.database);
    //             resolve(this.db);
    //         } catch (e) {
    //             reject(e);
    //         }
    //     });
    // }

    public connect(): Promise<Db> {
        return new Promise(async (resolve, reject) => {
            try {
                const client = new MongoClient(this.url, {
                    connectTimeoutMS: 30 * 1000
                });

                await client.connect();

                this.db = client.db(this.database);

                // await this.initCache();
                resolve(this.db);
            } catch (e) {
                reject(e);
            }
        });
    }
}

