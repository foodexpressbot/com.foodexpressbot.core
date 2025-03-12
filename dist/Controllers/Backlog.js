"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const dateUtil_1 = __importDefault(require("../Util/dateUtil"));
;
const types_1 = require("com.foodexpressbot.types/types");
class Backlog extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        // this.db.collection<BacklogOptions>('back_log').createIndexes([
        //     {
        //         'chef': ;''
        //     },
        //     {
        //         'deliveredBy': 1
        //     }
        // ], { unique: false });
    }
    addToLog(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('back_log').insertOne(data);
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    updateLog(filter, data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { orderID: filter };
                await this.db.collection('back_log').updateOne(filter, data);
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    findOrder(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { orderID: filter };
                const query = await this.findOrders(filter);
                resolve(query[0]);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    findOrdersByUser(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('back_log').find({
                    orderedBy: userID
                }).toArray();
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    findOrders(filter, limit = 25, sort = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('back_log').find(filter).limit(limit).sort(sort).toArray();
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getFeedbackOrders(filter, limit = 3, sort = { addedAt: 1 }) {
        return new Promise(async (resolve, reject) => {
            try {
                const orders = await this.findOrders({
                    ...filter,
                    type: types_1.BacklogTypes.Delivered,
                    addedAt: {
                        $gte: (0, dateUtil_1.default)().subtract(30, 'minute').valueOf()
                    },
                    orderFeedback: { $exists: false }
                }, limit, sort);
                resolve(orders);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getFeedbackOrder(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const orders = await this.findOrders(filter, 1);
                resolve(orders[0] ?? null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = Backlog;
//# sourceMappingURL=Backlog.js.map