"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../Constants");
const Controller_1 = __importDefault(require("../Structure/Controller"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
const generateUniqueID_1 = __importDefault(require("../Util/generateUniqueID"));
const REPORT_ALLOWED_FIELDS = ['orderID', 'reportReason', 'notes', 'reportedAt'];
class ReportsController extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        // this.collection = this.db.collection('user_warnings');
        // this.allowedFields = ['userID', 'warning', 'issuedAt', 'expiresAt', 'issuedBy'];
    }
    createOrderReport(report) {
        return new Promise(async (resolve, reject) => {
            try {
                const reportID = (0, generateUniqueID_1.default)();
                const data = {
                    _id: reportID,
                    ...report,
                    reportedAt: Date.now()
                };
                // Insert the report to the database
                await this.db.collection('user_order_reports').insertOne(data);
                // Alert the Discord channel a new report has been submitted.
                await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.managementCommands, ':paperclip: | **Order Report**: Order ID: `' + data.orderID + '`\n\nPlease review this report on the website.');
                resolve(data);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    deleteOrderReport(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                // Insert the report to the database
                await this.db.collection('user_order_reports').deleteOne(filter);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getOrderReport(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const report = await this.getOrderReports(filter, null, 1);
                resolve(report.length > 0 ? report[0] : null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getOrderReports(filter, sort, limit) {
        return new Promise(async (resolve, reject) => {
            try {
                const aggregation = [];
                if (filter) {
                    aggregation.push({
                        $match: {
                            ...filter
                        }
                    });
                }
                if (sort) {
                    aggregation.push({
                        $sort: {
                            ...sort
                        }
                    });
                }
                if (limit) {
                    aggregation.push({
                        $limit: limit
                    });
                }
                aggregation.push({
                    $lookup: {
                        from: 'users',
                        localField: 'reportedBy',
                        foreignField: '_id',
                        as: 'reportedBy'
                    }
                });
                aggregation.push({
                    $unwind: {
                        path: '$reportedBy',
                        preserveNullAndEmptyArrays: true
                    }
                });
                aggregation.push({
                    $lookup: {
                        from: 'back_log',
                        localField: 'orderID',
                        foreignField: 'orderID',
                        as: 'orderInfo'
                    }
                });
                aggregation.push({
                    $unwind: {
                        path: '$orderInfo',
                        preserveNullAndEmptyArrays: true
                    }
                });
                aggregation.push({
                    $project: (0, formatAggregate_1.default)([...REPORT_ALLOWED_FIELDS, 'orderInfo', ...(0, Constants_1.USER_AGGREGATE_FIELDS)('reportedBy')], true)
                });
                const reports = await this.db.collection('user_order_reports').aggregate(aggregation).toArray();
                resolve(reports);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = ReportsController;
//# sourceMappingURL=Reports.js.map