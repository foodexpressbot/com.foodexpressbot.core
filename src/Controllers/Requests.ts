import {
	RequestAnyOption,
	RequestBlacklistOption,
	RequestBacklogOption,
	BacklogTypes
<<<<<<< HEAD
} from 'com.foodexpressbot.types/types';
=======
} from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)
import { USER_AGGREGATE_FIELDS } from '../Constants';
import Controller from '../Structure/Controller';
import formatAggregate from '../Util/formatAggregate';
import generateUniqueID from '../Util/generateUniqueID';

const REPORT_ALLOWED_FIELDS = ['orderID', 'reportReason', 'notes', 'reportedAt'];

enum RequestEmbedColours {
	Backlog = 28671,
	Blacklist = 16711714
}

export default class RequestsController extends Controller {
	constructor(client, db) {
		super(client, db);
		// this.collection = this.db.collection('user_warnings');
		// this.allowedFields = ['userID', 'warning', 'issuedAt', 'expiresAt', 'issuedBy'];
	}

	public createRequest(request: RequestAnyOption): Promise<RequestAnyOption> {
		return new Promise(async (resolve, reject) => {
			try {
				const requestID = generateUniqueID() as any;
				const data: RequestAnyOption = {
					_id: requestID,
					...request,
					requestedAt: Date.now()
				};

				// Define the Discord message
				let discordMessage;

				if (data.requestType === 'backlog') {
					const requestOption = request as RequestBacklogOption;

					// Check if the order has already been reported
					const reported = await this.db.collection<RequestBacklogOption>('report_requests').findOne({
						orderID: requestOption.orderID
					});

					// If reported, resolve silently.
					if (reported) return resolve(reported);

					// Get the order information
					const backlog = await this.client.controllers.backlog.findOrder({
						orderID: requestOption.orderID
					});

					// Check if there is a valid order
					if (!backlog) return reject({
						statusCode: 404,
						code: 'backlog_not_found',
						message: 'Order not found with specified ID'
					});

					const emebdFields: { name: string, value: string, inline?: boolean }[] = [
						{
							name: ':hash: Order ID',
							value: backlog.orderID,
							inline: true
						},
						{
							name: ':hammer: Order Action',
							value: BacklogTypes[backlog.type],
							inline: true
						},
						{
							name: ':pizza: User Order',
							value: backlog.userOrder,
							inline: true
						},
					];

					if (backlog?.chefNote) {
						emebdFields.push({
							name: ':notes~1: Chef Note',
							value: backlog.chefNote,
							inline: true
						});
					}

					if (backlog?.orderFeedback?.feedbackMessage) {
						emebdFields.push({
							name: ':speech_balloon: User Feedback',
							value: backlog.orderFeedback?.feedbackMessage,
							inline: true
						});
					}

					if (backlog?.reason) {
						emebdFields.push({
							name: 'Reason',
							value: backlog.reason
						});
					}

					if (backlog?.reportReason) {
						emebdFields.push({
							name: ':pen_fountain: Report Reason',
							value: backlog.reportReason
						});
					}

					if (backlog?.images?.length >= 1) {
						emebdFields.push({
							name: ':frame_photo: Images',
							value: backlog.images.map((img: string) => img).join(' ')
						});
					}

					// TODO: Move to seperate function to be able to generate emebds from multiple controllers and interactions
					// TODO: Add blacklist & warn button
					// Create the report message
					discordMessage = {
						content: ':new: | **Backlog Request**\n**Requester**: <@' + request.requestedBy  + '>\n**Request Reason**: ' + request.reason + '\n\n*Information of the requested order is provided below.*',
						embeds: [
							{
								title: ':rewind: Backlog Report',
								description: '**Ordered By**: <@' + backlog.orderedBy + '> ' + (backlog.chef ? '| **Chef**: <@' + backlog.chef + '>' : '') + '' + (backlog.deliveredBy ? ' | **Delivered By**: <@' + backlog.deliveredBy + '>' : ''),
								color: RequestEmbedColours.Backlog,
								fields: emebdFields,
								timestamp: new Date(backlog.addedAt).toISOString(),
								footer: {
									text: 'Added at'
								}
							}
						],
						components: [
							{
								type: 1,
								components: [
									{
										type: 3,
										custom_id: 'request-take-action',
										// value: 'xxxxx',
										options: [
											{
												label: 'Blacklist User',
												description: 'Blacklist the user who sent the order.',
												value: 'blacklist-user-' + backlog.orderedBy,
												emoji: {
													name: '🔨',
													animated: false
												}
											}
										],
										placeholder: 'Take Action',
										disabled: false
									}
								]
							},
							{
								type: 1,
								components: [
									{
										type: 2,
										style: 3,
										label: 'No Action Required',
										custom_id: 'no-action',
										emoji: {
											name: '☑️',
											animated: false
										}
									}
								]
							}
						]
					};

					await this.client.controllers.discord.createMessage('1186741601318469662', discordMessage);


				} else if (data.requestType === 'blacklist') {

				} else {

				}

				if (this.client.clientOptions.discord?.channels?.userRequests?.reports) {
					try {
						await this.client.controllers.discord.createMessage(this.client.clientOptions.discord?.channels?.userRequests?.reports, discordMessage);
					} catch (e) {

					}
				}

				// Insert the request to the database
				// await this.db.collection<RequestAnyOption>('report_requests').insertOne(data);

				// // Alert the Discord channel a new report has been submitted.
				// await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.managementCommands, ':paperclip: | **Order Report**: Order ID: `' + data.orderID + '`\n\nPlease review this report on the website.');

				resolve(data);
			} catch (e) {
				reject(e);
			}
		});
	}

	// public deleteOrderReport(filter: object): Promise<void> {
	// 	return new Promise(async (resolve, reject) => {
	// 		try {
	// 			// Insert the report to the database
	// 			await this.db.collection<ReportOrderOptions>('user_order_reports').deleteOne(filter);
	//
	// 			resolve();
	// 		} catch (e) {
	// 			reject(e);
	// 		}
	// 	});
	// }
	//
	// public getOrderReport(filter: object): Promise<ReportOrderOptions | null> {
	// 	return new Promise(async (resolve, reject) => {
	// 		try {
	// 			const report = await this.getOrderReports(filter, null, 1);
	//
	// 			resolve(report.length > 0 ? report[0] :  null);
	// 		} catch (e) {
	// 			reject(e);
	// 		}
	// 	});
	// }
	//
	// public getOrderReports(filter: object, sort?: object | null, limit?: number): Promise<ReportOrderOptions[]> {
	// 	return new Promise(async (resolve, reject) => {
	// 		try {
	// 			const aggregation = [];
	//
	// 			if (filter) {
	// 				aggregation.push({
	// 					$match: {
	// 						...filter
	// 					}
	// 				});
	// 			}
	//
	// 			if (sort) {
	// 				aggregation.push({
	// 					$sort: {
	// 						...sort
	// 					}
	// 				});
	// 			}
	//
	// 			if (limit) {
	// 				aggregation.push({
	// 					$limit: limit
	// 				});
	// 			}
	//
	// 			aggregation.push({
	// 				$lookup: {
	// 					from: 'users',
	// 					localField: 'reportedBy',
	// 					foreignField: '_id',
	// 					as: 'reportedBy'
	// 				}
	// 			});
	//
	// 			aggregation.push({
	// 				$unwind: {
	// 					path: '$reportedBy',
	// 					preserveNullAndEmptyArrays: true
	// 				}
	// 			});
	//
	// 			aggregation.push({
	// 				$lookup: {
	// 					from: 'back_log',
	// 					localField: 'orderID',
	// 					foreignField: 'orderID',
	// 					as: 'orderInfo'
	// 				}
	// 			});
	//
	// 			aggregation.push({
	// 				$unwind: {
	// 					path: '$orderInfo',
	// 					preserveNullAndEmptyArrays: true
	// 				}
	// 			});
	//
	// 			aggregation.push({
	// 				$project: formatAggregate([...REPORT_ALLOWED_FIELDS, 'orderInfo', ...USER_AGGREGATE_FIELDS('reportedBy')], true)
	// 			});
	//
	// 			const reports = await this.db.collection<ReportOrderOptions>('user_order_reports').aggregate(aggregation).toArray();
	//
	// 			resolve(reports as ReportOrderOptions[]);
	// 		} catch (e) {
	// 			reject(e);
	// 		}
	// 	});
	// }
}
