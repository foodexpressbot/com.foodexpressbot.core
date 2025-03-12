import Controller from '../Structure/Controller';
import dateUtil from '../Util/dateUtil';;
import { BacklogOptions, BacklogTypes } from 'com.foodexpressbot.types/types';

export default class Backlog extends Controller {
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

    public addToLog(data: BacklogOptions): Promise<object> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<BacklogOptions>('back_log').insertOne(data);
                resolve(query);
            } catch (e) {

                return reject(e);
            }
        });
    }

    public updateLog(filter: string | object, data: object): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { orderID: filter };
                await this.db.collection<BacklogOptions>('back_log').updateOne(filter, data);
                resolve();
            } catch (e) {

                return reject(e);
            }
        });
    }

    public findOrder(filter: string | object): Promise<BacklogOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { orderID: filter };
                const query = await this.findOrders(filter);
                resolve(query[0]);
            } catch (e) {

                return reject(e);
            }
        });
    }
    public findOrdersByUser(userID: string): Promise<BacklogOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<BacklogOptions>('back_log').find({
                    orderedBy: userID
                }).toArray();
                resolve(query);
            } catch (e) {

                return reject(e);
            }
        });
    }
    public findOrders(filter: object, limit: number = 25, sort: object = {}): Promise<BacklogOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<BacklogOptions>('back_log').find(filter).limit(limit).sort(sort as any).toArray();
                resolve(query as BacklogOptions[]);
            } catch (e) {

                return reject(e);
            }
        });
    }

    public getFeedbackOrders(filter: object, limit: number = 3, sort: object = { addedAt: 1 }): Promise<BacklogOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const orders = await this.findOrders({
                    ...filter,
                    type: BacklogTypes.Delivered,
                    addedAt: {
                        $gte: dateUtil().subtract(30, 'minute').valueOf()
                    },
                    orderFeedback: { $exists: false }
                }, limit, sort);
                resolve(orders);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getFeedbackOrder(filter: object): Promise<BacklogOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const orders = await this.findOrders(filter, 1);
                resolve(orders[0] ?? null);
            } catch (e) {

                reject(e);
            }
        });
    }
}
