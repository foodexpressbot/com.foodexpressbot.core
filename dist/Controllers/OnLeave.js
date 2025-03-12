"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
const escapeMarkdown_1 = __importDefault(require("../Util/escapeMarkdown"));
const dayjs_1 = __importDefault(require("dayjs"));
const Snowflake_1 = __importDefault(require("../Structure/Snowflake"));
const types_1 = require("com.foodexpressbot.types/types");
const Constants_1 = require("../Constants");
class OnLeaveController extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['userID', 'startDate', 'expiry', 'reason', 'status', 'sentAt'];
    }
    createRequest(userID, data, logToDiscord) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof userID === 'string')
                    userID = { _id: userID };
                const user = await this.client.controllers.user.getUser(userID);
                if (!user)
                    return reject({ statusCode: 404, code: 'user_not_found', message: 'User not found' });
                const requestID = Snowflake_1.default.generate();
                await this.db.collection('on_leave').insertOne({
                    _id: requestID,
                    userID: user.id,
                    startDate: new Date(data.startDate).valueOf(),
                    expiry: new Date(data.expiry).valueOf(),
                    reason: data.reason,
                    status: data.status !== undefined ? data.status : types_1.OnLeaveStatus.PENDING,
                    authorisedBy: null,
                    sentAt: Date.now()
                });
                if (logToDiscord) {
                    this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.onLeaveLog, ':inbox_tray: | **' + (0, escapeMarkdown_1.default)(user.displayName || user.username) + '** (`' + user._id + '`) has submitted an inactivity request.').catch(() => null);
                }
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getRequest(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { _id: filter };
                const request = await this.getRequests(filter, null, 1);
                resolve(request[0]);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getRequests(filter, sort = { sentAt: -1 }, limit = 100) {
        return new Promise(async (resolve, reject) => {
            try {
                const aggregation = [
                    {
                        $match: {
                            ...filter
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userID',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ];
                if (sort) {
                    aggregation.push({
                        $sort: sort
                    });
                }
                if (limit) {
                    aggregation.push({
                        $limit: 100
                    });
                }
                aggregation.push({
                    $project: (0, formatAggregate_1.default)([...this.allowedFields, ...(0, Constants_1.USER_AGGREGATE_FIELDS)('user')])
                });
                const requests = await this.db.collection('on_leave').aggregate(aggregation).toArray();
                resolve(requests);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    updateRequestStatus(filter, status, authorisedBy, declineReason) {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await this.getRequest(filter);
                if (!request)
                    return reject({ statusCode: 404, code: 'request_not_found', message: 'Request not found' });
                if (request.status === status)
                    return reject({ statusCode: 400, code: 'request_already_updated', message: 'Request status has not changed' });
                const startTimestamp = (0, dayjs_1.default)(request.startDate).unix();
                const endTimestamp = (0, dayjs_1.default)(request.expiry).unix();
                switch (status) {
                    case types_1.OnLeaveStatus.APPROVED:
                        this.client.controllers.discord.sendUserDM(request.userID, ':briefcase: | Your inactivity request has been approved, enjoy your break.').catch(() => null);
                        this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.onLeaveLog, ':alarm_clock: | **' + (0, escapeMarkdown_1.default)(request.user.displayName || request.user.username) + '** (`' + request.user._id + '`) is on leave from <t:' + startTimestamp + ':F> (<t:' + startTimestamp + ':R>) until <t:' + endTimestamp + ':F> (<t:' + endTimestamp + ':R>)').catch(() => null);
                        break;
                    case types_1.OnLeaveStatus.DENIED:
                        this.client.controllers.discord.sendUserDM(request.userID, ':x: | Your inactivity request has been declined.\n**Reason**: ' + (0, escapeMarkdown_1.default)(declineReason || '[No reason was provided]')).catch(() => null);
                        break;
                }
                await this.db.collection('on_leave').updateOne({
                    _id: request._id
                }, { $set: { status, authorisedBy, declineReason } });
                resolve(await this.getRequest(request._id));
            }
            catch (e) {
                reject(e);
            }
        });
    }
    deleteRequest(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { _id: filter };
                await this.db.collection('on_leave').deleteOne(filter);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getActiveRequests(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const filter = {
                    status: types_1.OnLeaveStatus.APPROVED,
                    startDate: {
                        $lte: Date.now()
                    },
                    $or: [
                        {
                            expiry: null
                        },
                        {
                            expiry: {
                                $gt: Date.now()
                            }
                        }
                    ]
                };
                if (userID)
                    filter['userID'] = userID;
                const requests = await this.getRequests(filter, null, null);
                resolve(requests);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = OnLeaveController;
//# sourceMappingURL=OnLeave.js.map