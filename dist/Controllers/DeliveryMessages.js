"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const constants_1 = require("com.foodexpressbot.types/constants");
const generateUniqueID_1 = __importDefault(require("../Util/generateUniqueID"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
const slugify_1 = __importDefault(require("../Util/slugify"));
class DeliveryMessages extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['title', 'message', 'slug', 'createdBy', 'createdAt', 'lastUpdatedAt'];
    }
    createMessage(options) {
        return new Promise(async (resolve, reject) => {
            try {
                const messageID = (0, generateUniqueID_1.default)();
                const data = {
                    _id: messageID,
                    ...options,
                    createdAt: Date.now()
                };
                // Insert the document into  the database
                await this.db.collection('delivery_messages').insertOne(data);
                resolve(data);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    updateMessage(filter, options) {
        return new Promise(async (resolve, reject) => {
            try {
                // Update the document into  the database
                await this.db.collection('delivery_messages').updateOne(filter, options);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    deleteMessage(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                // Delete document from the database
                await this.db.collection('delivery_messages').deleteOne(filter);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    generateSlug(title) {
        return new Promise(async (resolve, reject) => {
            try {
                const slug = (0, slugify_1.default)(title);
                let valid = false;
                let number = 1;
                let generatedSlug = slug;
                while (valid === false) {
                    // Check if the slug is already used
                    const slugUsed = await this.db.collection('delivery_messages').countDocuments({ slug: generatedSlug });
                    if (slugUsed) {
                        generatedSlug = slug + '-' + number;
                        number++;
                    }
                    else {
                        valid = true;
                    }
                }
                return resolve(generatedSlug);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getDeliveryMessages(filter, options, fields) {
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
                if (options?.sample) {
                    aggregation.push({
                        $sample: {
                            size: options.sample
                        }
                    });
                }
                if (options?.sort && Object.entries(options?.sort).length > 0) {
                    aggregation.push({
                        $sort: {
                            ...options.sort
                        }
                    });
                }
                if (options?.limit) {
                    aggregation.push({
                        $limit: options.limit
                    });
                }
                aggregation.push({
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdByUser'
                    }
                });
                aggregation.push({
                    $unwind: {
                        path: '$createdByUser',
                        preserveNullAndEmptyArrays: true
                    }
                });
                aggregation.push({
                    $project: (0, formatAggregate_1.default)([...this.allowedFields, ...(0, constants_1.USER_AGGREGATE_FIELDS)('createdByUser'), ...(fields ?? [])], true)
                });
                const messages = await this.db.collection('delivery_messages').aggregate(aggregation).toArray();
                resolve(messages);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getDeliveryMessage(filter, fields) {
        return new Promise(async (resolve, reject) => {
            try {
                const messages = await this.getDeliveryMessages(filter, null, fields);
                resolve(messages.length > 0 ? messages[0] : null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = DeliveryMessages;
//# sourceMappingURL=DeliveryMessages.js.map