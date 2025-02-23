import { ModMailTicketOptions, ModMailBlockedUsers, ModMailTicketStatus } from 'com.foodexpressbot.types/types';
import Controller from '../Structure/Controller';
import { Message } from 'discord.js';
import { TextChannel } from 'eris';
import ignoredModMailMessages from '../Data/ignoredModMailMessages';

export default class ModMailController extends Controller {
	constructor(client, db) {
		super(client, db);
		this.collection = this.db.collection('discord_modmail');
	}

	public getTicket(filter: object): Promise<ModMailTicketOptions | null> {
		return new Promise(async (resolve, reject) => {
			try {
				const query = await this.collection.findOne<ModMailTicketOptions>(filter);

				resolve(query || null);
			} catch (e) {
				reject(e);
			}
		});
	}


	public initTicket(userID: string, query: string): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				// Check if the response is just a 1 worded response like "ok" or "thanks"
				if (query && ignoredModMailMessages.includes(query.trim().toLowerCase())) return resolve(null);

				// Check  the message length
				if (query.length >= 1500) return reject('Message length can only be a maximum of 1500 characters, please split your message.');

				// Check if the user is blocked
				if (await this.isBlocked(userID)) return reject('You have been blocked from creating tickets, if you believe this is an error, contact an administrator.');

				// Check if there is an active ticket
				const ticket = await this.getTicket({
					userID,
					status: ModMailTicketStatus.OPEN
				});

				// Reject if there is an active ticket
				if (ticket) return reject('Ticket is already open.');

				// Create the ticket!
				await this.createTicket({
					userID,
					status: ModMailTicketStatus.OPEN,
					question: query
				});

				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	public createTicket(options: Partial<ModMailTicketOptions>, user?: any): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				// TODO: Add a check to see if the channel is valid?

				// Generate an ID for the ticket
				const ticketID: string = 'ticket-' + Math.round(Math.random() * (100000 - 10000) + 10000);

				// Create the ticket channel
				const ticketChannel = await this.client.controllers.discord.createChannel(this.client.clientOptions.discord.guilds.management, ticketID, 0, {
					reason: 'AUTO CREATION: User has initiated a Mod Mail ticket',
					parentID: this.client.clientOptions.discord.channels.modmail.category,
					topic: 'ID: ' + ticketID + ' | User: <@' + options.userID + '> | View pinned messages for more information.'
				}) as TextChannel;

				// Author?

				const data = {
					_id: ticketID,
					channelID: ticketChannel.id,
					logs: [],
					...options
				};

				console.log(3)
				// Add the data to the database
				await this.db.collection<ModMailTicketOptions>('discord_modmail').insertOne(data as ModMailTicketOptions);

				console.log(ticketChannel);

				// Create a message
				const ticketMessage = ticketChannel.createMessage({
					embeds: [
						{
							title: '🎟️ | New Ticket',
							description: 'Tickets can be responded to by using the `/respond` command.\nTickets can be closed by using the `/close` command.',
							footer: {
								text: 'Sent at'
							},
							fields: [
								{
									name: 'User',
									value: user ? user.username + ' (' + user.id + ')' : options.userID,
									inline: false
								},
								{
									name: 'Ticket',
									value: options.question,
									inline: false
								}
							],
							timestamp: new Date().toISOString()
						}
					]
				}).catch(() => null);

				// Pin the message in the channel
				// await ticketMessage.pin();

				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	public updateTicket(ticket: ModMailTicketOptions, message: Message): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	public handleDMMessage(ticket: ModMailTicketOptions, message: Message): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				// Check  the message length
				if (message.content.length >= 1500) return reject('Message length can only be a maximum of 1500 characters, please split your message.');

				// Check if the user is blocked
				if (await this.isBlocked(ticket.userID)) return reject('You have been blocked from creating tickets, if you believe this is an error, contact an administrator.');

				await this.updateTicket(ticket, message);

				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	// public updateTicket(ticket: ModMailTicketOptions, message: any, staffMember?: any): Promise<void> {
	// 	return new Promise(async (resolve, reject) => {
	// 		try {
	// 			const attachments = message.attachments.map((a) => a.url).filter(a => a);
	//
	// 			// if (!ticketChannel || !author || !ticketChannel.permissionsOf(this.client.user.id).has('sendMessages')) return this.closeTicket(ticket, staffMember, true);
	//
	// 			if (staffMember && author) {
	// 				// Respond to the user in DMs.
	// 				const dmChannel = await author.getDMChannel();
	// 				if (!dmChannel) return reject('Unable to resolve DMs with users, try again later or close the ticket.');
	// 				await dmChannel.createMessage('💬 | **Staff Member**: ' + message.content + (attachments.length >= 1 ? ('\n' + 'Staff Member sent **' + attachments.length + '** attachment' + (attachments.length === 1 ? '' : 's') + ': \n' + attachments.map((a) => a).join('\n')) : ''));
	// 			} else if (!staffMember && author) {
	// 				// Respond to ticket chat
	// 				await ticketChannel.createMessage('💬 | **' + author.username + '#' + author.discriminator + '**: ' + message.content + (attachments.length >= 1 ? '\n' + 'User sent **' + attachments.length + '** attachment' + (attachments.length === 1 ? '' : 's') + ': \n' + attachments.map((a) => a).join('\n') : ''));
	// 			} else {
	// 				await this.closeTicket(ticket, staffMember);
	// 				return reject('Unable to resolve author information, closing ticket.');
	// 			}
	// 			await this.collection.updateOne({ _id: ticket._id }, {
	// 				$push: { messages: { userID: staffMember ? staffMember.id : ticket.userID, message: message.content } }
	// 			});
	// 			resolve();
	// 		} catch (e) {
	// 			reject(e);
	// 		}
	// 	});
	// }

	public isBlocked(userID: string): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
            try {
                const blacklisted = await this.db.collection<ModMailBlockedUsers>('discord_modmail_blocked_users').findOne({
					_id: userID
				});

                return resolve(!!blacklisted);
            } catch (e) {
                reject(e);
            }
        });
	}
}
