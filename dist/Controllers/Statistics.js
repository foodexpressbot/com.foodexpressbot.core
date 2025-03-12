"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const Constants_1 = require("../Constants");
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
class StatisticsController extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.collection = this.db.collection('statistics');
        this.allowedFields = ['appealsUpvoted', 'blacklists', 'backlogs', 'warnings', 'applications'];
    }
    getManagementStatistics(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const statistics = await this.listManagementStatistics({ _id: userID }, 1);
                resolve(statistics.length > 0 ? statistics[0] : null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    deleteManagementStatistics(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection('management_statistics').deleteOne({ _id: userID });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    listManagementStatistics(filter, limit, sort) {
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
                        $project: (0, formatAggregate_1.default)([...this.allowedFields, ...(0, Constants_1.USER_AGGREGATE_FIELDS)('user')], false)
                    }
                ]).toArray();
                resolve(statistics);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    incManagementStatistics(userID, statistic) {
        return new Promise(async (resolve, reject) => {
            try {
                const fieldsToRecord = Array.isArray(statistic) ? statistic : [statistic];
                await this.db.collection('management_statistics').updateOne({ _id: userID }, {
                    $push: {
                        [statistic]: Date.now()
                    }
                }, { upsert: true });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = StatisticsController;
//# sourceMappingURL=Statistics.js.map