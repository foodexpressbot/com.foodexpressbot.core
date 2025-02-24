import Controller from '../Structure/Controller';
<<<<<<< HEAD
import { ShareDeliveryMessageOptions } from 'com.foodexpressbot.types/types';
import { USER_AGGREGATE_FIELDS } from 'com.foodexpressbot.types/constants';
=======
import { ShareDeliveryMessageOptions } from 'com.virtualdinerbot.types/types';
import { USER_AGGREGATE_FIELDS } from 'com.virtualdinerbot.types/constants';
>>>>>>> 70d76e4 (Initial commit)
import generateUniqueID from '../Util/generateUniqueID';
import formatAggregate from '../Util/formatAggregate';
import slugify from '../Util/slugify';

export default class DeliveryMessages extends Controller {
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['title', 'message', 'slug', 'createdBy', 'createdAt', 'lastUpdatedAt'];
    }

    public createMessage(options: Partial<ShareDeliveryMessageOptions>): Promise<ShareDeliveryMessageOptions> {
        return new Promise(async (resolve, reject) => {
           try {
               const messageID = generateUniqueID() as any;
               const data: ShareDeliveryMessageOptions = {
                   _id: messageID,
                   ...options as ShareDeliveryMessageOptions,
                   createdAt: Date.now()
               };

               // Insert the document into  the database
               await this.db.collection<ShareDeliveryMessageOptions>('delivery_messages').insertOne(data);

               resolve(data);
           } catch (e) {
               reject(e);
           }
        });
    }

    public updateMessage(filter: Partial<ShareDeliveryMessageOptions>, options: object): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // Update the document into  the database
                await this.db.collection<ShareDeliveryMessageOptions>('delivery_messages').updateOne(filter, options);

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    public deleteMessage(filter: Partial<ShareDeliveryMessageOptions>): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // Delete document from the database
                await this.db.collection<ShareDeliveryMessageOptions>('delivery_messages').deleteOne(filter);

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    public generateSlug(title: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const slug = slugify(title);
                let valid: boolean = false;
                let number: number = 1;

                let generatedSlug = slug;

                while (valid === false) {
                    // Check if the slug is already used
                    const slugUsed = await this.db.collection('delivery_messages').countDocuments({ slug: generatedSlug });

                    if (slugUsed) {
                        generatedSlug = slug + '-' + number;
                        number++;
                    } else {
                        valid = true;
                    }
                }

                return resolve(generatedSlug);
            } catch (e) {
                reject(e);
            }
        });
    }

    public getDeliveryMessages(filter?: object, options?: { sort?: object, limit?: number, sample?: number }, fields?: string[]): Promise<ShareDeliveryMessageOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const aggregation: any[] = [];

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
                    $project: formatAggregate([...this.allowedFields, ...USER_AGGREGATE_FIELDS('createdByUser'), ...(fields ?? [])], true)
                });

                const messages = await this.db.collection<ShareDeliveryMessageOptions>('delivery_messages').aggregate(aggregation).toArray();

                resolve(messages as ShareDeliveryMessageOptions[]);
            } catch (e) {
                reject(e);
            }
        });
    }

    public getDeliveryMessage(filter?: object, fields?: string[]): Promise<ShareDeliveryMessageOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const messages = await this.getDeliveryMessages(filter, null, fields);

                resolve(messages.length > 0 ? messages[0] : null);
            } catch (e) {
                reject(e);
            }
        });
    }
}
