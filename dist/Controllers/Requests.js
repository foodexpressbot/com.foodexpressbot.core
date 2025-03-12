"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("com.foodexpressbot.types/types");
const Controller_1 = __importDefault(require("../Structure/Controller"));
const generateUniqueID_1 = __importDefault(require("../Util/generateUniqueID"));
const REPORT_ALLOWED_FIELDS = ['orderID', 'reportReason', 'notes', 'reportedAt'];
var RequestEmbedColours;
(function (RequestEmbedColours) {
    RequestEmbedColours[RequestEmbedColours["Backlog"] = 28671] = "Backlog";
    RequestEmbedColours[RequestEmbedColours["Blacklist"] = 16711714] = "Blacklist";
})(RequestEmbedColours || (RequestEmbedColours = {}));
class RequestsController extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        // this.collection = this.db.collection('user_warnings');
        // this.allowedFields = ['userID', 'warning', 'issuedAt', 'expiresAt', 'issuedBy'];
    }
    createRequest(request) {
        return new Promise(async (resolve, reject) => {
            try {
                const requestID = (0, generateUniqueID_1.default)();
                const data = {
                    _id: requestID,
                    ...request,
                    requestedAt: Date.now()
                };
                // Define the Discord message
                let discordMessage;
                if (data.requestType === 'backlog') {
                    const requestOption = request;
                    // Check if the order has already been reported
                    const reported = await this.db.collection('report_requests').findOne({
                        orderID: requestOption.orderID
                    });
                    // If reported, resolve silently.
                    if (reported)
                        return resolve(reported);
                    // Get the order information
                    const backlog = await this.client.controllers.backlog.findOrder({
                        orderID: requestOption.orderID
                    });
                    // Check if there is a valid order
                    if (!backlog)
                        return reject({
                            statusCode: 404,
                            code: 'backlog_not_found',
                            message: 'Order not found with specified ID'
                        });
                    const emebdFields = [
                        {
                            name: ':hash: Order ID',
                            value: backlog.orderID,
                            inline: true
                        },
                        {
                            name: ':hammer: Order Action',
                            value: types_1.BacklogTypes[backlog.type],
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
                            value: backlog.images.map((img) => img).join(' ')
                        });
                    }
                    // TODO: Move to seperate function to be able to generate emebds from multiple controllers and interactions
                    // TODO: Add blacklist & warn button
                    // Create the report message
                    discordMessage = {
                        content: ':new: | **Backlog Request**\n**Requester**: <@' + request.requestedBy + '>\n**Request Reason**: ' + request.reason + '\n\n*Information of the requested order is provided below.*',
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
                }
                else if (data.requestType === 'blacklist') {
                }
                else {
                }
                if (this.client.clientOptions.discord?.channels?.userRequests?.reports) {
                    try {
                        await this.client.controllers.discord.createMessage(this.client.clientOptions.discord?.channels?.userRequests?.reports, discordMessage);
                    }
                    catch (e) {
                    }
                }
                // Insert the request to the database
                // await this.db.collection<RequestAnyOption>('report_requests').insertOne(data);
                // // Alert the Discord channel a new report has been submitted.
                // await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.managementCommands, ':paperclip: | **Order Report**: Order ID: `' + data.orderID + '`\n\nPlease review this report on the website.');
                resolve(data);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = RequestsController;
//# sourceMappingURL=Requests.js.map