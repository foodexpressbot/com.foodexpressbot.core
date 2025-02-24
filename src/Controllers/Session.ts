import Controller from '../Structure/Controller';
<<<<<<< HEAD
import { SessionOptions } from 'com.foodexpressbot.types/types';
=======
import { SessionOptions } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)
import crypto from 'crypto';
import formatAggregate from '../Util/formatAggregate';

// Should this be moved to types?
// export interface SessionOptions {
//     id?: string;
//     _id?: string;
//     userID?: string;
//     lastUsed?: number;
//     expiry?: number;
//     device?: {
//         device?: string;
//         browser?: string;
//         os?: string;
//         ip?: number;
//     }
// }

export default class SessionController extends Controller {
    constructor(client, db) {
        super(client, db);
        this.collection = this.db.collection('sessions');
        this.allowedFields = ['userID', 'lastUsed', 'expiry', 'device'];
    }

    public createSession(data: SessionOptions): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.collection.insertOne(data as object);
                resolve(data._id);
            } catch (e) {
                reject(e);
            }
        });
    }

    public getSession(filter: string | object): Promise<SessionOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const sessions = await this.getSessions(filter);
                resolve(sessions.length > 0 ? sessions[0] : null);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getSessions(filter: string | object): Promise<SessionOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { _id: filter };
                if (filter['_id']) filter['_id'] = await this.decryptToken(filter['_id']);
                const query = await this.db.collection('sessions').aggregate([
                    { $match: filter },
                    { $project: formatAggregate(this.allowedFields, true) }
                ]).toArray();
                resolve(query);
            } catch (e) {

                reject(e);
            }
        });
    }

    public deleteSession(sessionID: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection<SessionOptions>('sessions').deleteOne({ _id: await this.decryptToken(sessionID) });
                resolve(true);
            } catch (e) {

                reject(e);
            }
        });
    }

    public deleteSessions(query: object): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection('sessions').deleteMany(query);
                resolve(true);
            } catch (e) {

                reject(e);
            }
        });
    }

    public async generateToken(): Promise<string> {
        let token: string;
        while (!token) {
            try {
                const sessionToken = crypto.createHash('sha256').update(Math.random().toString()).digest('hex');
                if (!(await this.db.collection<SessionOptions>('sessions').findOne({ _id: sessionToken }))) token = sessionToken;
            } catch (e) {
                console.error(e);
            }
        }
        return token;
    }

    public decryptToken(token): Promise<string | null> {
        return new Promise((resolve) => {
            this.client.encrypyter.decrypt(token).then(async (sessionToken) => {
                resolve(sessionToken);
            }).catch(() => {
                resolve(null);
            });
        });
    }

}
