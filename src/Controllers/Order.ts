import Controller from '../Structure/Controller';
import { UserOptions, Permissions, BacklogTypes, OrderReportOptions, OrderOptions, OrderStatus } from 'com.foodexpressbot.types/types';
import Perms from '../Util/Permissions';
import formatAggregate from '../Util/formatAggregate';
import { escapeMarkdown } from 'discord.js';
import axios from 'axios';
import dateUtil from '../Util/dateUtil';

export default class Order extends Controller {
    declare public allowedFields: string[];
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['user', 'guild', 'order', 'orderUserMentions', 'status', 'orderExpiry', 'chefNote', 'prepareExpiry', 'prepareDuration', 'deliveryAssignedTo', 'claimedBy', 'priority', 'sentAt', 'orderChannel', 'images'];
    }

    public sendOrder(data: OrderOptions): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const orderID = this.generateOrderID(6);
                const query = await this.db.collection<OrderOptions>('orders').insertOne({ _id: orderID, ...data });
                data.orderID = orderID;
                this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.orderLog, ':pizza: | ' + (data.priority ? ':exclamation: Priority Order :exclamation:\n️' : '') + ' (**`' + data.orderID + '`**) Order from: ' +
                    '**' + data.user.username + '** (`' + data.user.id + '`)\n' +
                    (data.guild.id ? '**Server ID:** `' + data.guild.id + '`' : '*Order was sent via direct message.*') +
                    '\n**User Order:**```' + data.order  + '```' +
                    '*Order was sent <t:' + dateUtil().unix() + ':R>*').catch(() => null);
                this.client.rabbitmq.sendToGateway('orderSent', data);
                resolve(query as OrderOptions);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public cancelOrder(orderID: string, user: UserOptions): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const order = await this.getOrder(orderID);
                if (!order) return reject({ statusCode: 404, code: 'order_not_found', message: 'Order not found' });
                await this.client.controllers.backlog.addToLog({
                    orderID: order.orderID,
                    userOrder: order.order,
                    orderedBy: order.user.id,
                    reason: '[ORDER WAS CANCELLED BY USER]',
                    type: BacklogTypes.Cancel,
                    addedAt: Date.now()
                });
                await this.removeOrder(order.orderID);
                this.client.rabbitmq.sendToGateway('orderCancelled', { order, user });
                resolve(order);
            } catch (e) {
                reject(e);
            }
        });
    }


    public getOrders(filter?: object, fields: string[] = []): Promise<OrderOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('orders').aggregate([
                    { $match: { ...filter } },
                    { $sort: { sentAt: 1, priority: 1 } },
                    { $project: formatAggregate([...this.allowedFields, ...fields], false, { _id: false, orderID: '$_id' }) }
                ]).toArray();
                resolve(query);
            } catch (e) {

                return reject(e);
            }
        });
    }

    public getOrder(filter: string | object, fields: string[] = []): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { _id: filter };
                const query = await this.getOrders(filter, fields);
                resolve(query[0] as OrderOptions);
            } catch (e) {

                return reject(e);
            }
        });
    }

    public searchImages(query: string): Promise<{ description: string, url: string }[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await axios.get('https://api.unsplash.com/search/photos?query=' + encodeURIComponent(query), {
                    headers: {
                        'Authorization': 'Client-ID ' + this.client.clientOptions.tokens?.unsplash
                    }
                });

                const images = request.data.results.map((data) => {
                    return {
                        description: data.description,
                        url: data.urls.regular
                    };
                });

                resolve(images);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public claimOrder(orderID: string, user: UserOptions | 'bot'): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const order = await this.getOrder(orderID, ['claimedBy']);
                if (!order) return reject({ statusCode: 404, code: 'order_not_found', message: 'Order not found' });
                if (user === 'bot') return resolve(order);
                const perms = new Perms(user.permissions || 0);
                if (order.user.id === user.id && !perms.hasPermission(Permissions.SUPER_ADMIN)) return reject({ statusCode: 400, code: 'order_unavailable', message: 'You cannot claim your own order' });
                if (order.status !== OrderStatus.Unclaimed || order.claimedBy && order.claimedBy.expiry <= Date.now()) {
                    if (order.status === OrderStatus.Claimed && order.claimedBy && order.claimedBy.user === user.id) return resolve(order);
                    else return reject({ statusCode: 400, code: 'order_unavailable', message: 'Order has already been claimed by another chef' });
                }
                const hasClaimedOrder = await this.getOrder({ status: OrderStatus.Claimed, 'claimedBy.user': user.id });
                if (hasClaimedOrder) return reject({ statusCode: 400, code: 'active_order', message: 'You already have a claimed order' });
                const updatedOrder = await this.updateOrder(orderID, { claimedBy: { user: user.id, expiry: dateUtil().add(4, 'minutes').valueOf() }, status: OrderStatus.Claimed });
                resolve(updatedOrder as OrderOptions);
            } catch (e) {

                reject(e);
            }
        });
    }

    public unclaimOrder(orderID: string, user: UserOptions): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const order = await this.getOrder({ _id: orderID, 'claimedBy.user': user.id, status: OrderStatus.Claimed }, ['claimedBy']);
                if (!order) return reject({ statusCode: 404, code: 'order_not_found', message: 'Order not found' });
                const updatedOrder = await this.updateOrder(orderID, { claimedBy: null, status: OrderStatus.Unclaimed });
                resolve(updatedOrder as OrderOptions);
            } catch (e) {

                reject(e);
            }
        });
    }

    public deleteOrder(orderID: string, user: UserOptions | null, reason: string): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const order = await this.getOrder(orderID, ['claimedBy']);
                if (!order) return reject({ statusCode: 404, code: 'order_not_found', message: 'Order not found' });
                const perms = new Perms(user?.permissions || 0);
                if (user && order.user.id === user.id && !perms.hasPermission(Permissions.SUPER_ADMIN)) return reject({ statusCode: 400, code: 'order_unavailable', message: 'You cannot delete your own order' });
                if (user && order.status !== OrderStatus.Claimed || !order.claimedBy) {
                    await this.claimOrder(orderID, user ? user : 'bot');
                }
                await this.client.controllers.backlog.addToLog({
                    orderID: order.orderID,
                    chef: user ? user.id : this.client.clientOptions.discord.clientID,
                    userOrder: order.order,
                    orderedBy: order.user.id,
                    reason,
                    type: BacklogTypes.Delete,
                    addedAt: Date.now()
                });
                if (user) {
                    await this.addOrdersToUser(user);
                }
                await this.removeOrder(order.orderID);
                this.client.rabbitmq.sendToGateway('orderDeleted', { order, user, reason });
                this.client.controllers.discord.sendUserDM(order.user.id, ':wastebasket: | Your order (`' + order.orderID + '`) has been deleted.\n**Reason:** ' + (reason ? reason : 'No reason provided.')).catch(() => null);
                resolve(order);
            } catch (e) {

                reject(e);
            }
        });
    }

    public prepareOrder(orderID: string, user: UserOptions, imageURLs: string[] | null, chefNote: string | null): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const order = await this.getOrder(orderID, ['claimedBy']);
                if (!order) return reject({ statusCode: 404, code: 'order_not_found', message: 'Order not found' });
                const perms = new Perms(user.permissions || 0);
                if (order.user.id === user.id && !perms.hasPermission(Permissions.SUPER_ADMIN)) return reject({ statusCode: 400, code: 'order_unavailable', message: 'You cannot prepare your own order' });
                if (order.status !== OrderStatus.Claimed || !order.claimedBy) {
                    await this.claimOrder(orderID, user ? user : 'bot');
                }
                if (!imageURLs) return reject({ statusCode: 400, code: 'invalid_body', message: 'You must provide at least one image URL' });
                if (!Array.isArray(imageURLs)) return reject({ statusCode: 400, code: 'invalid_body', message: 'Images must be an array' });
                if (!imageURLs.length) return reject({ statusCode: 400, code: 'invalid_body', message: 'You must provide at least one image URL' });
                if (imageURLs.length > 3) return reject({ statusCode: 400, code: 'invalid_body', message: 'A maximum of 3 images are allowed' });
                if (chefNote && chefNote.trim().length > 500) return reject({ statusCode: 400, code: 'invalid_body', message: 'Chef note character limit has been exceeded' });
                const images = await this.validateImages(imageURLs);

                if (!images.valid.length) return reject({ statusCode: 400, code: 'invalid_images', message: 'None of the images provided were valid' });
                if (images.valid.reduce((a, b) => a + b).length >= 1500)  return reject({ statusCode: 400, code: 'invalid_images', message: 'Images must have a shorter URL' });

                if (user) {
                    await this.addOrdersToUser(user);
                }

                await this.updateOrder(orderID, { chefNote, images: images.valid, prepareExpiry: Date.now() + (order.prepareDuration || 180000), status: OrderStatus.Preparing });
                this.client.controllers.discord.sendUserDM(order.user.id, ':man_cook: | Your order (`' + order.orderID + '`) is now being prepared. Preparing takes up to 3 minutes.' + (chefNote ? '\n**Chef Message:** ' + chefNote : '')).catch(() => null);
                resolve(order);
            } catch (e) {

                reject(e);
            }
        });
    }

    public deliverOrder(orderID: string, user: UserOptions | null, report: boolean = false, reportInfo: { reason: string } = { reason: null }): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                const order = await this.getOrder({
                    $or: [
                        {
                            deliveryAssignedTo: { $exists: false }
                        },
                        {
                            deliveryAssignedTo: null
                        },
                        {
                            'deliveryAssignedTo.userID': user?.id
                        },
                        {
                            'deliveryAssignedTo.expiry': { $lte: Date.now() }
                        }
                    ],
                    _id: orderID,
                }, ['claimedBy']);
                if (!order) return reject({ statusCode: 404, code: 'order_not_found', message: 'Order not found' });
                const perms = new Perms(user?.permissions || 0);
                if (user && order.user.id === user.id && !perms.hasPermission(Permissions.SUPER_ADMIN)) return reject({ statusCode: 400, code: 'order_unavailable', message: 'You cannot deliver your own order' });
                if (order.status !== OrderStatus.PendingDelivery) return reject({ statusCode: 400, code: 'order_unavailable', message: 'Order is not ready to be delivered yet' });
                const deliveryMessage = await this.getDeliveryMessage(user ? user : null, order);
                if (!report && deliveryMessage.length >= 1650) return reject({ statusCode: 400, code: 'delivery_message_length', message: 'Delivery message length is too long, please change your message' });

                await this.client.controllers.backlog.addToLog({
                    orderID: order.orderID,
                    deliveredBy: user?.id || this.client.clientOptions.discord.clientID,
                    chef: order.claimedBy?.user || null,
                    userOrder: order.order,
                    orderedBy: order.user.id,
                    type: report ? BacklogTypes.Reported : BacklogTypes.Delivered,
                    reportReason: report ? reportInfo.reason : null,
                    images: order.images,
                    reason: null,
                    chefNote: order.chefNote,
                    addedAt: Date.now()
                });

                if (user) {
                    await this.addOrdersToUser(user);
                }

                await this.removeOrder(orderID);

                const message: string = ':truck: | Delivery for order `' + order.orderID + '`!\n\n' + deliveryMessage + '\n\n*This was an automated message, the delivery message above is provided by the deliverer. Enjoy your order!*';

                if (report) {
                    this.client.controllers.discord.sendUserDM(order.user.id, ':newspaper: | Your order (`' + order.orderID + '`) has been reported and therefore cannot be delivered. This is commonly due to an invalid image being provided. A staff member will investigate this.').catch(() => null);
                    await this.reportOrder(order.orderID, reportInfo.reason);
                } else {
                    const deliveryMessage = message.length >= 2000 ? '<@' + order.user.id + '> Provided message was too long, defaulting to images - ' + order.images.join(',') : message;
                    try {
                        // Attempt to send the message to the channel
                        await this.client.controllers.discord.createMessage(order.orderChannel, {
                            content: deliveryMessage,
                            allowedMentions: {
                                users: true,
                                everyone: false,
                                roles: false
                            }
                        });
                    } catch {
                        try {
                            // If unable to deliver to channel, attempt to send message to users DMs
                            await this.client.controllers.discord.sendUserDM(order.user.id, deliveryMessage);
                        } catch {
                            // Error silently
                        }
                    }
                }

                this.client.rabbitmq.sendToGateway('deliverOrder', { order, user, deliveryMessage, report });
                resolve(order);
            } catch (e) {

                reject(e);
            }
        });
    }

    public updateOrder(filter: string | object, data: object): Promise<OrderOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { _id: filter };
                await this.db.collection('orders').updateOne(filter, { $set: { ...data } });
                const updated = await this.getOrder(filter);
                this.client.rabbitmq.sendToGateway('orderUpdated', updated);
                resolve(updated as OrderOptions);
            } catch (e) {
                reject(e);
            }
        });
    }

    public removeOrder(filter: string | object): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = { _id: filter };
                await this.db.collection('orders').deleteOne(filter);
                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public reportOrder(orderID: string, reason: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection<OrderReportOptions>('order_reports').insertOne({ _id: orderID, reason });
                const totalReports = await this.db.collection('order_reports').countDocuments();
                await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.managementCommands, ':paperclip: | **Order Report**: Order ID: `' + orderID + '` **Reason**: `' + reason + '`  | There ' + (totalReports === 1 ? 'is' : 'are') + ' now ' + totalReports + ' report' + (totalReports === 1 ? '' : 's') + '.');
                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public getOrderReports(): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<OrderReportOptions>('order_reports').find().toArray() as unknown as OrderReportOptions[];
                resolve(query.map((r: OrderReportOptions) => r._id));
            } catch (e) {
                reject(e);
            }
        });
    }

    public getOrderReport(orderID: string): Promise<OrderReportOptions | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection<OrderReportOptions>('order_reports').findOne({ _id: orderID }) as OrderReportOptions;
                resolve(query);
            } catch (e) {
                reject(e);
            }
        });
    }

    public deleteOrderReport(orderID: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection<OrderReportOptions>('order_reports').deleteOne({ _id: orderID });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    public deleteOrderReports(query: object): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection<OrderReportOptions>('order_reports').deleteMany(query);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    private async getDeliveryMessage(user: UserOptions | null, order: OrderOptions): Promise<string> {
        const defaultMessage: string = 'Hi, {user.mention}! ' +
            'Here is your `{order}`. Feel free to leave feedback with the `/feedback` command. ' +
            'In addition to that, you could also join our Discord server using the `/discord` command. '
            + 'Enjoy, and have a great day!' +
            '\n\n{order.images}';
        let message: string;
        // Is this broken?
        // if (user?.settings?.deliveryMessage?.message && user?.settings?.deliveryMessage?.disabled !== false) {
        //     message = user.settings.deliveryMessage.message;
        // } else {
        //     message = defaultMessage;
        // }
        if (user && user.settings && user.settings.deliveryMessage && !user.settings.deliveryMessage.disabled && user.settings.deliveryMessage.message) {
            message = user.settings.deliveryMessage.message;
        } else {
            message = defaultMessage;
        }
        return message
            .replaceAll('{user.username}', order.user.username)
            .replaceAll('{user.mention}', '<@' + order.user.id + '>')
            .replaceAll('{user.id}', order.user.id)
            .replaceAll('{user.discriminator}', '0000') // @deprecated

            .replaceAll('{guild.invite}', 'https://discord.gg/' + this.client.clientOptions.discord.inviteCode)
            .replaceAll('{order}', order.order)
            .replaceAll('{order.id}', order.orderID)
            .replaceAll('{order.images}', order.images ? order.images.map((i: string) => i).join(' ') : '')

            .replaceAll('{deliverer.username}', user ? (user.displayName || user.username) : '[Automated]')
            .replaceAll('{deliverer.mention}', '<@' + (user?.id || this.client.clientOptions.discord.clientID) + '>')
            .replaceAll('{deliverer.id}', user ? user.id : this.client.clientOptions.discord.clientID)

            .replaceAll('{deliverer.discriminator}', '0000'); // @deprecated
    }

    private validateImages(urls: string[]): Promise<{ valid: string[], invalid: string [] }> {
        return new Promise(async (resolve) => {
            const images = { valid: [], invalid: [] };
            for (const url of urls) {
                try {
                    const image = await axios.get(url, { timeout: 5 * 1000 });
                    const contentType = image.headers['content-type'];
                    if (contentType?.startsWith('image/')) {
                        images.valid.push(url);
                    } else {
                        images.invalid.push(url);
                    }
                    // if ((image.headers['content-type']).match(/(image)+\//g) && ((image.headers['content-type']).match(/(image)+\//g)).length !== 0) images.valid.push(url);
                    // else images.invalid.push(url);
                } catch {
                    images.invalid.push(url);
                }
            }

            resolve(images);
        });
    }

    private addOrdersToUser(user: UserOptions, amount: number = 1): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if teams are enabled, if so add the orders to the team
                if (await this.client.controllers.settings.getSetting('teamsEnabled') && user.team) {
                    await this.client.controllers.team.incrementOrders(user.team, amount);
                }

                await this.client.controllers.user.createOrUpdateUser(user.id, null, { $inc: { 'statistics.orders.weeklyOrders': amount, 'statistics.orders.totalOrders': amount }});
                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public generateOrderID(length: number = 6): string {
        let result: string = '';
        const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

}
