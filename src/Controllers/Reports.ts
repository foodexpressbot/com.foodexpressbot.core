<<<<<<< HEAD
import { ReportOrderOptions } from 'com.foodexpressbot.types/types';
=======
import { ReportOrderOptions } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)
import { USER_AGGREGATE_FIELDS } from '../Constants';
import Controller from '../Structure/Controller';
import formatAggregate from '../Util/formatAggregate';
import generateUniqueID from '../Util/generateUniqueID';


const REPORT_ALLOWED_FIELDS = ['orderID', 'reportReason', 'notes', 'reportedAt'];

export default class ReportsController extends Controller {
	constructor(client, db) {
		super(client, db);
		// this.collection = this.db.collection('user_warnings');
		// this.allowedFields = ['userID', 'warning', 'issuedAt', 'expiresAt', 'issuedBy'];
	}

	public createOrderReport(report: Partial<ReportOrderOptions>): Promise<ReportOrderOptions> {
		return new Promise(async (resolve, reject) => {
			try {
				const reportID = generateUniqueID() as any;
				const data: ReportOrderOptions = {
					_id: reportID,
					...report as ReportOrderOptions,
					reportedAt: Date.now()
				};

				// Insert the report to the database
				await this.db.collection<ReportOrderOptions>('user_order_reports').insertOne(data);

				// Alert the Discord channel a new report has been submitted.
				await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.managementCommands, ':paperclip: | **Order Report**: Order ID: `' + data.orderID + '`\n\nPlease review this report on the website.');

				resolve(data);
			} catch (e) {
				reject(e);
			}
		});
	}

	public deleteOrderReport(filter: object): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				// Insert the report to the database
				await this.db.collection<ReportOrderOptions>('user_order_reports').deleteOne(filter);

				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	public getOrderReport(filter: object): Promise<ReportOrderOptions | null> {
		return new Promise(async (resolve, reject) => {
			try {
				const report = await this.getOrderReports(filter, null, 1);

				resolve(report.length > 0 ? report[0] :  null);
			} catch (e) {
				reject(e);
			}
		});
	}

	public getOrderReports(filter: object, sort?: object | null, limit?: number): Promise<ReportOrderOptions[]> {
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
					$project: formatAggregate([...REPORT_ALLOWED_FIELDS, 'orderInfo', ...USER_AGGREGATE_FIELDS('reportedBy')], true)
				});

				const reports = await this.db.collection<ReportOrderOptions>('user_order_reports').aggregate(aggregation).toArray();

				resolve(reports as ReportOrderOptions[]);
			} catch (e) {
				reject(e);
			}
		});
	}
}
