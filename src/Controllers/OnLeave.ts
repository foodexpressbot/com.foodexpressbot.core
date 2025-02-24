import Controller from '../Structure/Controller';
import formatAggregate from '../Util/formatAggregate';
import escapeMarkdown from '../Util/escapeMarkdown';
import dayjs from 'dayjs';
import Snowflake from '../Structure/Snowflake';
<<<<<<< HEAD
import { OnLeaveOptions, OnLeaveStatus } from 'com.foodexpressbot.types/types';
=======
import { OnLeaveOptions, OnLeaveStatus } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)
import { USER_AGGREGATE_FIELDS } from '../Constants';

export default class OnLeaveController extends Controller {
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['userID', 'startDate', 'expiry', 'reason', 'status', 'sentAt'];
    }

    public createRequest(userID: string | object, data: Partial<OnLeaveOptions>, logToDiscord?: boolean): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof userID === 'string') userID = { _id: userID };
                const user = await this.client.controllers.user.getUser(userID);
                if (!user) return reject({ statusCode: 404, code: 'user_not_found', message: 'User not found' });

                const requestID = Snowflake.generate();
                await this.db.collection<OnLeaveOptions>('on_leave').insertOne({
                    _id: requestID,
                    userID: user.id,
                    startDate: new Date(data.startDate).valueOf(),
                    expiry: new Date(data.expiry).valueOf(),
                    reason: data.reason,
                    status: data.status !== undefined ? data.status : OnLeaveStatus.PENDING,
                    authorisedBy: null,
                    sentAt: Date.now()
                });

                if (logToDiscord) {
                    this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.onLeaveLog, ':inbox_tray: | **' + escapeMarkdown(user.displayName || user.username) + '** (`' + user._id + '`) has submitted an inactivity request.').catch(() => null);
                }
                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public getRequest(filter: string | object): Promise<OnLeaveOptions | null> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { _id: filter };
                const request = await this.getRequests(filter, null, 1);
                resolve(request[0]);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getRequests(filter?: object, sort: object | null = { sentAt: -1 }, limit: number | null = 100): Promise<OnLeaveOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const aggregation: any = [
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
                    $project: formatAggregate([...this.allowedFields, ...USER_AGGREGATE_FIELDS('user')])
                });

                const requests = await this.db.collection<OnLeaveOptions>('on_leave').aggregate(aggregation).toArray();
                resolve(requests as OnLeaveOptions[]);
            } catch (e) {

                reject(e);
            }
        });
    }

    public updateRequestStatus(filter: string | object, status: OnLeaveStatus, authorisedBy: string, declineReason?: string): Promise<OnLeaveOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await this.getRequest(filter);
                if (!request) return reject({ statusCode: 404, code: 'request_not_found', message: 'Request not found' });

                if (request.status === status) return reject({ statusCode: 400, code: 'request_already_updated', message: 'Request status has not changed' });

                const startTimestamp: number = dayjs(request.startDate).unix();
                const endTimestamp: number = dayjs(request.expiry).unix();

                switch (status) {
                    case OnLeaveStatus.APPROVED:
                        this.client.controllers.discord.sendUserDM(request.userID, ':briefcase: | Your inactivity request has been approved, enjoy your break.').catch(() => null);
                        this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.onLeaveLog, ':alarm_clock: | **' + escapeMarkdown(request.user.displayName || request.user.username) + '** (`' + request.user._id + '`) is on leave from <t:' + startTimestamp + ':F> (<t:' + startTimestamp + ':R>) until <t:' + endTimestamp + ':F> (<t:' + endTimestamp+ ':R>)').catch(() => null);
                        break;
                    case OnLeaveStatus.DENIED:
                        this.client.controllers.discord.sendUserDM(request.userID, ':x: | Your inactivity request has been declined.\n**Reason**: ' + escapeMarkdown(declineReason || '[No reason was provided]')).catch(() => null);
                        break;
                }

                await this.db.collection<OnLeaveOptions>('on_leave').updateOne({
                    _id: request._id }, { $set: { status, authorisedBy, declineReason } });

                resolve(await this.getRequest(request._id));
            } catch (e) {

                reject(e);
            }
        });
    }

    public deleteRequest(filter: string | object): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { _id: filter };
                await this.db.collection<OnLeaveOptions>('on_leave').deleteOne(filter);
                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public getActiveRequests(userID?: string): Promise<OnLeaveOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter = {
                    status: OnLeaveStatus.APPROVED,
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

                if (userID) filter['userID'] = userID;

                const requests = await this.getRequests(filter, null, null);
                resolve(requests);
            } catch (e) {

                reject(e);
            }
        });
    }
}
