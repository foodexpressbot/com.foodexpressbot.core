import Controller from '../Structure/Controller';
import { USER_AGGREGATE_FIELDS  } from '../Constants';
import formatAggregate from '../Util/formatAggregate';
import { ManagementStatisticOptions } from 'com.foodexpressbot.types/types';

export default class StatisticsController extends Controller {
    constructor(client, db) {
        super(client, db);
        this.collection = this.db.collection('statistics');

        this.allowedFields = ['appealsUpvoted', 'blacklists', 'backlogs', 'warnings', 'applications'];
    }

    public getManagementStatistics(userID: string): Promise<ManagementStatisticOptions | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const statistics = await this.listManagementStatistics({ _id: userID }, 1);
                resolve(statistics.length > 0 ? statistics[0] : null);
            } catch (e) {
                reject(e);
            }
        });
    }

    public deleteManagementStatistics(userID: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection<ManagementStatisticOptions>('management_statistics').deleteOne({ _id: userID });

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }


    public listManagementStatistics(filter?: object, limit?: number, sort?: object): Promise<ManagementStatisticOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = [];

                if (filter) {
                    query.push({
                        $match: filter
                    });
                }

                if (limit) {
                    query.push({
                        $limit: limit
                    });
                }

                if (sort) {
                    query.push({
                        $sort: sort
                    });
                }

                const statistics = await this.db.collection('management_statistics').aggregate([
                    ...query,
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: '$user'
                    },
                    {
                        $project: formatAggregate([...this.allowedFields, ...USER_AGGREGATE_FIELDS('user')], false)
                    }
                ]).toArray();
                resolve(statistics as ManagementStatisticOptions[]);
            } catch (e) {
                reject(e);
            }
        });
    }

    public incManagementStatistics(userID: string, statistic: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const fieldsToRecord: string[] = Array.isArray(statistic) ? statistic : [statistic];

                await this.db.collection<ManagementStatisticOptions>('management_statistics').updateOne({ _id: userID }, {
                    $push: {
                        [statistic]: Date.now()
                    }
                }, { upsert: true });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}

