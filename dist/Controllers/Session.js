"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const crypto_1 = __importDefault(require("crypto"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
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
class SessionController extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.collection = this.db.collection('sessions');
        this.allowedFields = ['userID', 'lastUsed', 'expiry', 'device'];
    }
    createSession(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.collection.insertOne(data);
                resolve(data._id);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getSession(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const sessions = await this.getSessions(filter);
                resolve(sessions.length > 0 ? sessions[0] : null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getSessions(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { _id: filter };
                if (filter['_id'])
                    filter['_id'] = await this.decryptToken(filter['_id']);
                const query = await this.db.collection('sessions').aggregate([
                    { $match: filter },
                    { $project: (0, formatAggregate_1.default)(this.allowedFields, true) }
                ]).toArray();
                resolve(query);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    deleteSession(sessionID) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection('sessions').deleteOne({ _id: await this.decryptToken(sessionID) });
                resolve(true);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    deleteSessions(query) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection('sessions').deleteMany(query);
                resolve(true);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    async generateToken() {
        let token;
        while (!token) {
            try {
                const sessionToken = crypto_1.default.createHash('sha256').update(Math.random().toString()).digest('hex');
                if (!(await this.db.collection('sessions').findOne({ _id: sessionToken })))
                    token = sessionToken;
            }
            catch (e) {
                console.error(e);
            }
        }
        return token;
    }
    decryptToken(token) {
        return new Promise((resolve) => {
            this.client.encrypyter.decrypt(token).then(async (sessionToken) => {
                resolve(sessionToken);
            }).catch(() => {
                resolve(null);
            });
        });
    }
}
exports.default = SessionController;
//# sourceMappingURL=Session.js.map