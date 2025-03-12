"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const escapeMarkdown_1 = __importDefault(require("../Util/escapeMarkdown"));
const generateUniqueID_1 = __importDefault(require("../Util/generateUniqueID"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
const Constants_1 = require("../Constants");
const types_1 = require("com.foodexpressbot.types/types");
class Appeal extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['userID', 'userAppeal', 'status', 'serverID', 'type', 'punishmentInfo', 'sentAt'];
    }
    createAppeal(userID, type, serverID = null, userAppeal) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.client.controllers.user.getUser(userID);
                if (!user)
                    return reject({ statusCode: 404, code: 'user_not_found', 'message': 'User not found' });
                // Check if there is already an appeal for this user
                const existingAppeal = await this.getUserAppeal({ userID, type, $or: [{ status: types_1.AppealStatus.PENDING }, { status: types_1.AppealStatus.ON_HOLD }] });
                if (existingAppeal)
                    return reject({ statusCode: 400, code: 'appeal_exists', message: 'Appeal already submitted for that case' });
                let punishmentInfo = {
                    punishmentID: null,
                    issuedBy: null,
                    reason: null,
                    issuedAt: null
                };
                if (type === types_1.AppealType.UserBlacklist || type === types_1.AppealType.ServerBlacklist) {
                    // Check if the user is blacklisted
                    const userBlacklist = type === types_1.AppealType.UserBlacklist;
                    const blacklists = await this.client.controllers.blacklist.getBlacklists([
                        {
                            $match: {
                                $or: [
                                    {
                                        _id: userID,
                                        type: 'user'
                                    },
                                    {
                                        _id: serverID,
                                        type: 'server'
                                    }
                                ]
                            }
                        }
                    ]);
                    const blacklist = blacklists.find((b) => b.type === (userBlacklist ? 'user' : 'server') && b._id === (userBlacklist ? userID : serverID));
                    if (!blacklist)
                        return reject({
                            statusCode: 404,
                            code: (userBlacklist ? 'user' : 'server') + '_not_blacklisted',
                            message: (userBlacklist ? 'User' : 'Server') + ' is not blacklisted'
                        });
                    if (!userBlacklist) {
                        const server = await this.client.controllers.discord.getGuild(serverID);
                        if (!server)
                            return reject({
                                statusCode: 404,
                                code: 'server_not_found',
                                message: 'Server was not found by specified ID'
                            });
                        if (server.ownerID !== userID)
                            return reject({
                                statusCode: 403,
                                code: 'not_server_owner',
                                message: 'You must be the server owner to appeal this server blacklist'
                            });
                    }
                    punishmentInfo = {
                        punishmentID: blacklist.id,
                        issuedBy: blacklist.blacklistedBy,
                        reason: blacklist.reason,
                        issuedAt: blacklist.blacklistedAt
                    };
                }
                else if (type === types_1.AppealType.DiscordBan) {
                    // Check if the user is banned
                    // TODO: Use AuditLog instead?
                    try {
                        const ban = await this.client.controllers.discord.getGuildBan(this.client.clientOptions.discord.guilds.main, userID);
                        punishmentInfo = {
                            punishmentID: null,
                            issuedBy: null,
                            reason: ban.reason,
                            issuedAt: null
                        };
                    }
                    catch {
                        return reject({ statusCode: 404, code: 'user_not_banned', message: 'User is not banned' });
                    }
                }
                else {
                    return reject({ statusCode: 400, code: 'invalid_appeal_type', message: 'Invalid appeal type' });
                }
                const appeal = {
                    _id: (0, generateUniqueID_1.default)(),
                    userID,
                    serverID,
                    type,
                    userAppeal,
                    punishmentInfo: punishmentInfo,
                    status: types_1.AppealStatus.PENDING,
                    votes: [],
                    sentAt: Date.now()
                };
                await this.db.collection('user_appeals').insertOne(appeal);
                try {
                    await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.appealLog, ':exclamation: | **' + (0, escapeMarkdown_1.default)(user.displayName || user.username) + '** [`' + user.id + '`] has sent an appeal.');
                }
                catch {
                    // Error silently
                }
                resolve(Object.assign({ id: appeal._id }, appeal));
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUserAppeals(filter, limit = 10, includeVotes, detailedVotes) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { userID: filter };
                const appeals = await this.db.collection('user_appeals').aggregate([
                    { $match: { ...filter } },
                    { $sort: { sentAt: -1 } },
                    { $limit: limit },
                    { $lookup: { from: 'users', localField: 'userID', foreignField: '_id', as: 'user' } },
                    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                    { $project: this.generateAggregationFields({ showVotes: includeVotes, showDetailedVotes: detailedVotes }) }
                ]).toArray();
                resolve(appeals);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUserAppeal(filter, includeVotes, detailVotes) {
        return new Promise(async (resolve, reject) => {
            try {
                const appeal = await this.getUserAppeals(filter, 1, includeVotes, detailVotes);
                resolve(appeal[0] || null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    voteAppeal(appealID, userID, vote, note, force) {
        return new Promise(async (resolve, reject) => {
            try {
                const appeal = await this.getUserAppeal({ _id: appealID }, true, true);
                if (!appeal)
                    return reject({ statusCode: 404, code: 'appeal_not_found', message: 'Appeal not found' });
                if (appeal.status !== types_1.AppealStatus.PENDING)
                    return reject({ statusCode: 400, code: 'appeal_not_pending', message: 'Appeal is not pending' });
                const upvote = vote === 'upvote';
                if (force) {
                    await this.acceptOrDenyAppeal(appeal, vote === 'upvote');
                    resolve(vote === 'upvote');
                }
                else {
                    const userVote = appeal.votes.find((vote) => vote.userID === userID);
                    // Calculate the new vote removing the old one and adding the new one
                    const acceptVotes = appeal.votes.filter((vote) => vote.upvoted).length + (upvote ? 1 : 0) - (userVote ? (userVote.upvoted ? 1 : 0) : 0);
                    const denyVotes = appeal.votes.filter((vote) => !vote.upvoted).length + (upvote ? 0 : 1) - (userVote ? (!userVote.upvoted ? 1 : 0) : 0);
                    if (userVote) {
                        // Remove the vote
                        await this.db.collection('user_appeals').updateOne({ _id: appealID }, { $pull: { votes: { userID } } });
                    }
                    if (!userVote) {
                        // Increase the vote count
                        await this.client.controllers.statistics.incManagementStatistics(userID, 'appealsUpvoted');
                    }
                    await this.db.collection('user_appeals').updateOne({ _id: appealID }, { $push: { votes: { userID, upvoted: upvote, note } } });
                    if (acceptVotes >= Constants_1.APPEAL_MIN_VOTE_COUNT) {
                        await this.acceptOrDenyAppeal(appeal, true);
                        resolve(true);
                    }
                    else if (denyVotes >= Constants_1.APPEAL_MIN_VOTE_COUNT) {
                        await this.acceptOrDenyAppeal(appeal, false);
                        resolve(false);
                    }
                    else {
                        return resolve(null);
                    }
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    acceptOrDenyAppeal(appeal, accept) {
        return new Promise(async (resolve, reject) => {
            try {
                if (accept) {
                    if (types_1.AppealType.DiscordBan === appeal.type) {
                        // Unban the user
                        try {
                            await this.db.collection('blacklists').deleteOne({ _id: appeal.userID, auto: true });
                            await this.client.controllers.discord.unbanGuildMember(this.client.clientOptions.discord.guilds.main, appeal.userID, 'Auto: User has had their appeal accepted.');
                        }
                        catch {
                            // Error silently
                        }
                    }
                    else if (types_1.AppealType.UserBlacklist === appeal.type) {
                        // Remove the user from the blacklist
                        const blacklist = await this.client.controllers.blacklist.getBlacklist(appeal.userID);
                        if (blacklist) {
                            if (blacklist.auto) {
                                try {
                                    await this.client.controllers.discord.unbanGuildMember(this.client.clientOptions.discord.guilds.main, appeal.userID, 'Auto: User has had their appeal accepted.');
                                }
                                catch {
                                    // Error silently
                                }
                            }
                            await this.client.controllers.blacklist.removeBlacklist(appeal.userID);
                        }
                    }
                    else if (types_1.AppealType.ServerBlacklist === appeal.type) {
                        // Remove the server from the blacklist
                        await this.client.controllers.blacklist.removeBlacklist(appeal.serverID);
                    }
                }
                try {
                    await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.appealLog, ':' + (accept ? 'tada' : 'x') + ': | **' + (0, escapeMarkdown_1.default)(appeal.user.displayName || appeal.user.username) + '** [`' + appeal.userID + '`] has had their appeal ' + (accept ? 'accepted' : 'denied') + '.');
                }
                catch {
                    // Error silently
                }
                await this.db.collection('user_appeals').updateOne({ _id: appeal.id }, { $set: { status: accept ? types_1.AppealStatus.ACCEPTED : types_1.AppealStatus.DENIED } });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    generateAggregationFields({ showVotes, showDetailedVotes }) {
        const fields = [];
        if (showVotes && !showDetailedVotes) {
            fields.push('votes.note');
        }
        else {
            fields.push('votes');
        }
        return (0, formatAggregate_1.default)([...this.allowedFields, ...(0, Constants_1.USER_AGGREGATE_FIELDS)().map((f) => f), ...fields], true);
    }
}
exports.default = Appeal;
//# sourceMappingURL=Appeal.js.map