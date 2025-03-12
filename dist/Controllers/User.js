"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const types_1 = require("com.foodexpressbot.types/types");
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
const Permissions_1 = __importDefault(require(".././Util/Permissions"));
const escapeMarkdown_1 = __importDefault(require("../Util/escapeMarkdown"));
const dateUtil_1 = __importDefault(require("../Util/dateUtil"));
const Logger_1 = __importDefault(require("../Util/Logger"));
const Snowflake_1 = __importDefault(require("../Structure/Snowflake"));
const Constants_1 = require("../Constants");
const snowflakes_1 = require("../Util/snowflakes");
class UserController extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.collection = this.db.collection('users');
        this.allowedFields = ['username', 'displayName', 'discriminator', 'avatar', 'perks', 'team', 'ranks', 'permissions', 'information', 'discordFlags', 'premiumType', 'flags', 'claimedAchievements', 'money', 'statistics'];
        this.init().catch(Logger_1.default.error);
    }
    async init() {
        await this.collection.createIndex({ username: 'text' });
    }
    // @deprecated use 'createUser' or 'updateUser' instead
    createOrUpdateUser(filter, data, rawData, upsert = true) {
        return new Promise(async (resolve, reject) => {
            try {
                let payload = {};
                if (typeof filter === 'string')
                    filter = { _id: filter };
                if (data) {
                    payload = { $set: data };
                }
                Object.assign(payload, rawData);
                await this.collection.updateOne(filter, payload, { upsert });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    updateUser(filter, data, upsert = false) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { _id: filter };
                await this.collection.updateOne(filter, data, { upsert });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUser(filter, fields = [], allowVanity) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') {
                    if (allowVanity) {
                        filter = { $or: [{ _id: filter }, { 'information.vanityURL': filter }] };
                    }
                    else {
                        filter = { _id: filter };
                    }
                }
                const users = await this.collection.aggregate([
                    {
                        $match: {
                            ...filter
                        }
                    },
                    {
                        $limit: 1
                    },
                    {
                        $lookup: {
                            from: 'ranks',
                            localField: 'ranks',
                            foreignField: '_id',
                            as: 'rankPerms'
                        }
                    },
                    // TODO: Complete migration of ranks
                    {
                        $set: {
                            permissions: {
                                $function: {
                                    body: 'function(perms) { return perms.reduce((prevV, currV) => prevV | currV, 0) }',
                                    args: [
                                        '$rankPerms.permissions'
                                    ],
                                    lang: 'js'
                                }
                            },
                            perks: {
                                $reduce: {
                                    input: {
                                        $map: {
                                            input: '$rankPerms',
                                            as: 'rankPerm',
                                            in: '$$rankPerm.perks'
                                        }
                                    },
                                    initialValue: '$perks',
                                    in: {
                                        $concatArrays: ['$$value', '$$this']
                                    }
                                }
                            }
                        },
                    },
                    {
                        $lookup: {
                            from: 'user_bans',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'ban'
                        }
                    },
                    {
                        $unwind: {
                            path: '$ban',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: (0, formatAggregate_1.default)([...this.allowedFields, ...fields, 'userPerks'], true)
                    }
                ]).toArray();
                resolve(users.length > 0 ? users[0] : null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    syncWithDiscord(user, force = false) {
        return new Promise(async (resolve, reject) => {
            try {
                if (user.settings?.nextSyncAllowed > Date.now() && !force)
                    return reject({ statusCode: 400, code: 'sync_not_allowed', message: 'Sync is not allowed yet' });
                const discordUser = await this.client.controllers.discord.getUser(user.id);
                if (!discordUser)
                    return reject({ statusCode: 404, code: 'discord_user_not_found', message: 'Discord user not found' });
                const updated = {
                    username: discordUser.username,
                    displayName: discordUser.global_name,
                    avatar: discordUser.avatar,
                    // premiumType: discordUser.premium_type,
                    // discordFlags: discordUser.public_flags,
                    lastUpdated: Date.now(),
                    'settings.nextSyncAllowed': (0, dateUtil_1.default)().add(1, 'hour').valueOf()
                };
                await this.updateUser(user._id, {
                    $set: updated,
                });
                resolve(updated);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUsers(filter, sort, limit, fields) {
        return new Promise(async (resolve, reject) => {
            try {
                const aggregation = [];
                if (filter) {
                    aggregation.push({
                        $match: filter
                    });
                }
                if (sort) {
                    aggregation.push({
                        $sort: sort
                    });
                }
                if (limit) {
                    aggregation.push({
                        $limit: limit
                    });
                }
                const query = await this.db.collection('users').aggregate([
                    ...aggregation,
                    {
                        $lookup: {
                            from: 'ranks',
                            localField: 'ranks',
                            foreignField: '_id',
                            as: 'rankPerms'
                        }
                    },
                    {
                        $set: {
                            permissions: {
                                $function: {
                                    body: 'function(perms) { return perms.reduce((prevV, currV) => prevV | currV, 0) }',
                                    args: [
                                        '$rankPerms.permissions'
                                    ],
                                    lang: 'js'
                                }
                            },
                            perks: {
                                $concatArrays: [
                                    {
                                        $first: '$rankPerms.perks'
                                    },
                                    '$perks'
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'user_bans',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'ban'
                        }
                    },
                    {
                        $unwind: {
                            path: '$ban',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: (0, formatAggregate_1.default)([...this.allowedFields, ...(fields ?? []), 'userPerks'], true)
                    }
                ]).toArray();
                resolve(query);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getTotalUsers(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const total = await this.collection.countDocuments(filter ?? {});
                resolve(total);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUsersPaginated(filter, sort, skip = 0, limit = 10, fields = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await this.collection.aggregate([
                    {
                        $facet: {
                            totalUsers: [
                                ...filter,
                                { $count: 'totalUsers' }
                            ],
                            users: [
                                ...filter,
                                {
                                    $skip: skip
                                },
                                {
                                    $limit: limit
                                },
                                {
                                    $lookup: {
                                        from: 'user_bans',
                                        localField: '_id',
                                        foreignField: '_id',
                                        as: 'ban'
                                    }
                                },
                                {
                                    $unwind: {
                                        path: '$ban',
                                        preserveNullAndEmptyArrays: true
                                    }
                                },
                                {
                                    $project: (0, formatAggregate_1.default)([...this.allowedFields, ...fields], true)
                                }
                            ]
                        }
                    }
                ]).toArray();
                resolve({ totalUsers: users[0].totalUsers[0]?.totalUsers || 0, users: users[0]?.users || [] });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUserSitemap(skip, limit) {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await this.collection.aggregate([
                    {
                        $match: {
                            'settings.hideProfile': { $ne: true }
                        }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    },
                    {
                        $project: {
                            _id: false,
                            userID: '$_id',
                            lastUpdated: true
                        }
                    }
                ]).toArray();
                resolve(users);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getTeam(bypassCache) {
        return new Promise(async (resolve, reject) => {
            try {
                const cached = await this.client.redis.getCache('teamUsers');
                if (cached && !bypassCache) {
                    return resolve(JSON.parse(cached));
                }
                else {
                    const query = await this.db.collection('ranks').aggregate([
                        {
                            $match: {
                                displayOnTeam: true
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: '_id',
                                foreignField: 'ranks',
                                as: 'users'
                            }
                        },
                        {
                            $sort: {
                                position: -1
                            }
                        },
                        {
                            $project: (0, formatAggregate_1.default)([...this.client.controllers.rank.allowedFields, ...(0, Constants_1.USER_AGGREGATE_FIELDS)('users')], true)
                        }
                    ]).toArray();
                    await this.client.redis.cache('teamUsers', JSON.stringify(query), 86400);
                    resolve(query);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    updateRanks(filter, ranks, announceToLog = false, logToHistory = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.getUser(filter);
                if (!user)
                    return reject({ statusCode: 404, code: 'user_not_found', message: 'User not found' });
                let newRanks = [];
                let oldRanks = [];
                // Get all ranks and remove duplicates
                for (const rank of [...new Set([...ranks, ...user.ranks])].filter((r) => r)) {
                    const r = await this.client.controllers.rank.getRank(rank, ['roleIDs', 'logUserRankHistory', 'useTeams']);
                    if (!r)
                        continue;
                    // if (user.ranks?.includes(rank) && !r) return reject({ statusCode: 404, code: 'rank_not_found', message: 'Rank "' + rank + '" not found' });
                    if (ranks.includes(r._id)) {
                        newRanks.push(r);
                    }
                    if (user.ranks.includes(r._id)) {
                        oldRanks.push(r);
                    }
                }
                // Sort the ranks by highest position first
                newRanks = newRanks.sort((a, b) => b.position - a.position);
                oldRanks = oldRanks.sort((a, b) => b.position - a.position);
                if (await this.client.controllers.settings.getSetting('teamsEnabled')) {
                    // This **should** assign a random team when their rank is updated if the rank uses teams.
                    // Check if newRanks has useTeams enabled and if so, add the user to a random team.
                    if (!user.team && newRanks.some((r) => r.useTeams)) {
                        const team = await this.client.controllers.team.getRandomTeam();
                        await this.client.controllers.team.updateUserTeam(user._id, team);
                    }
                    // Check if the user has a team and the newRanks doesn't have useTeams enabled and if so, remove the user from the team.
                    if (user.team && !newRanks.some((r) => r.useTeams)) {
                        await this.client.controllers.team.updateUserTeam(user._id, null);
                    }
                }
                await this.updateUser(user.id, {
                    $set: {
                        ranks: newRanks.map((r) => r._id)
                        // ranks: ranks.filter((rankID: string) => newRanks.find((r: RankOptions) => r._id === rankID))
                    }
                });
                // Check if there are any new roles to add
                const roles = {
                    newRoles: newRanks.map((rank) => rank.roleIDs).flat(),
                    oldRoles: oldRanks.map((rank) => rank.roleIDs).flat()
                };
                // Add or remove Discord roles
                for (const role of [...roles.newRoles, ...roles.oldRoles]) {
                    if (roles.newRoles.includes(role) && !roles.oldRoles.includes(role)) {
                        this.client.controllers.discord.addMemberRole(this.client.clientOptions.discord.guilds.main, user.id, role, 'Auto Add: User Rank Updated').catch(() => null);
                    }
                    else if (roles.oldRoles.includes(role) && !roles.newRoles.includes(role)) {
                        this.client.controllers.discord.removeMemberRole(this.client.clientOptions.discord.guilds.main, user.id, role, 'Auto Add: User Rank Updated').catch(() => null);
                    }
                }
                // Define the ranks
                const newRank = newRanks[0] || null;
                const oldRank = oldRanks[0] || null;
                // Announce rank change to staff channel
                // TODO: Check if highest rank is higher than staff rank
                if (announceToLog) {
                    this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.staffChanges, ':arrow_heading_up: | <@' + user.id + '> has transferred from [**' + (oldRank?.name || 'Member') + '**] -> [**' + (newRank?.name || 'Member') + '**].').catch(() => null);
                }
                // Check if logToHistory has been overridden OR the rank has default logUserRankHistory set to true
                if (logToHistory === true || (logToHistory === null && (newRank?.logUserRankHistory === true || (oldRank?.logUserRankHistory === true)) && newRank?._id !== oldRank?._id)) {
                    await this.createUserRankHistory(user.id, oldRank?._id || null, newRank?._id || null);
                }
                // await this.client.redis.sendGateway('userRankUpdate', newUser, newUser.rank, user.rank);
                this.client.rabbitmq.sendToGateway('userRankUpdate', { userID: user.id, ranks: newRanks.map((rank) => rank._id), announceToLog });
                resolve(newRanks.map((rank) => rank._id));
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getBan(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { _id: filter };
                const ban = await this.db.collection('user_bans').findOne(filter);
                resolve(ban ? ban : null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    banUser(userID, bannedBy, reason, expiry, silent) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!(0, snowflakes_1.isSnowFlake)(userID))
                    return reject({ statusCode: 400, code: 'invalid_user_id', message: 'Invalid user ID' });
                const ban = await this.getBan(userID);
                const user = await this.getUser(userID);
                // Check if the user has any active ranks
                if (user?.ranks?.length > 0)
                    return reject({ statusCode: 400, code: 'user_has_ranks', message: 'User has active ranks, they must be removed first' });
                const data = {
                    _id: userID,
                    bannedBy: bannedBy ? bannedBy._id : null,
                    reason: reason || null,
                    expiry: expiry ? new Date(expiry).valueOf() : null,
                    bannedAt: Date.now()
                };
                // Insert or update the current ban
                await this.db.collection('user_bans').updateOne({ _id: userID }, {
                    $set: data
                }, { upsert: true });
                if (user) {
                    // Remove all sessions from the user
                    await this.client.controllers.session.deleteSessions({ userID });
                }
                if (!silent) {
                    try {
                        const unix = expiry ? (0, dateUtil_1.default)(expiry).unix() : null;
                        await this.client.controllers.discord.sendUserDM(userID, ':hammer: | ' + (ban ? 'Your website ban has been updated.' : 'You have been banned from our website.') + '\n**Reason**: ' + (reason || '*No reason has been provided.*') + (unix ? '\n**Expiry**: <t:' + (unix) + ':F> (<t:' + unix + ':R>)' : '') + '\n\n:question: If you believe this is a mistake, please contact a member of staff.');
                        await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.websiteBanLog, ':hammer: **[' + (ban ? 'BAN UPDATED' : 'NEW BAN') + ']** | ' +
                            (user ? ('<@' + userID + '>') : ('**' + (0, escapeMarkdown_1.default)(user.displayName || user.username) + '** (`' + user._id + '`)'))
                            + '\n**Reason**: ' + (reason || '*No reason was provided.*')
                            + '\n**Expiry**: ' + (unix ? '<t:' + (unix) + ':F> (<t:' + unix + ':R>)' : '*Never*')
                            + '\n**Banned By**: ' + (bannedBy ? ((0, escapeMarkdown_1.default)(bannedBy.displayName || bannedBy.username) + ' (`' + bannedBy._id + '`)') : '*System*'));
                    }
                    catch {
                        // Error silent
                    }
                }
                this.client.rabbitmq.sendToGateway('userBanned', { userID: user._id || userID, reason, expiry });
                resolve(data);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    unbanUser(userID, staffMember, silent) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!(0, snowflakes_1.isSnowFlake)(userID))
                    return reject({ statusCode: 400, code: 'invalid_user_id', message: 'Invalid user ID' });
                const ban = await this.getBan(userID);
                if (!ban)
                    return reject({ statusCode: 404, code: 'user_not_banned', message: 'User is not banned' });
                const user = await this.getUser(userID);
                // Revoke the ban
                await this.db.collection('user_bans').deleteOne({ _id: userID });
                if (!silent) {
                    try {
                        await this.client.controllers.discord.sendUserDM(userID, ':hammer: | Your website ban has lifted.');
                        await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.websiteBanLog, ':hammer: **[BAN REMOVED]** | ' +
                            (user ? ('<@' + userID + '>') : ('**' + (0, escapeMarkdown_1.default)(user.displayName || user.username) + '** (`' + user._id + '`)'))
                            + '\n**Removed By**: ' + (staffMember ? ((0, escapeMarkdown_1.default)(staffMember.displayName || staffMember.username) + ' (`' + staffMember._id + '`)') : '*System*'));
                    }
                    catch {
                        // Error silent
                    }
                }
                this.client.rabbitmq.sendToGateway('userUnbanned', { userID: user._id || userID });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    removeStaff(filter, removedBy, reason, nextApplicationAllowed = (0, dateUtil_1.default)().add(1, 'week').valueOf()) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { _id: filter };
                const user = await this.getUser(filter);
                if (!user)
                    return reject({ statusCode: 400, code: 'user_not_found', message: 'User not found' });
                const userRanks = await this.client.controllers.rank.formatRanks(user.ranks);
                const staffRanks = await this.client.controllers.rank.formatRanks(removedBy.ranks);
                // Check if the user has any staff ranks
                if (!userRanks.some(r => r.staffRank))
                    return reject({ statusCode: 400, code: 'user_not_staff', message: 'User is not staff' });
                // Check if the user has a higher rank than the staff member
                if (userRanks[0].position > staffRanks[0].position)
                    return reject({ statusCode: 400, code: 'user_not_staff', message: 'You cannot remove someone higher than you' });
                // Update when the next application is allowed
                if (nextApplicationAllowed)
                    await this.createOrUpdateUser(user.id, { 'staffApplications.nextApplicationAllowed': nextApplicationAllowed });
                // Remove the ranks
                await this.updateRanks(user.id, [], true);
                // Alert the user
                try {
                    await this.client.controllers.discord.sendUserDM(user.id, ':wave: | Unfortunately, you have been removed from our staff team.\n**Reason:** ' + (reason || 'No reason was provided.'));
                }
                catch {
                    // Unable to alert the user, ignore silently.
                }
                // Log to the channel
                await this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.staffRemovalLog, ':confounded: | **' + (removedBy.displayName || removedBy.username) + '** (`' + removedBy._id + '`) has removed <@' + user.id + '>\n**Reason:** ' + (reason || 'No reason was provided.'));
                resolve(true);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getLeaderboard(filter, since, limit, bypassCache) {
        return new Promise(async (resolve, reject) => {
            try {
                const cached = await this.client.redis.getCache('leaderboardUsers');
                if (cached && !since && !bypassCache) {
                    return resolve(JSON.parse(cached));
                }
                else {
                    if (!since)
                        since = (0, dateUtil_1.default)().startOf('week').valueOf();
                    let options = [];
                    if (limit && limit > 0)
                        options.push({ $limit: limit });
                    const query = await this.db.collection('users').aggregate([
                        {
                            $match: {
                                ...filter
                            }
                        },
                        {
                            $lookup: {
                                from: 'ranks',
                                localField: 'ranks',
                                foreignField: '_id',
                                as: 'ranks'
                            }
                        },
                        {
                            $match: {
                                'ranks.permissions': {
                                    $bitsAllSet: [types_1.Permissions.MANAGE_ORDERS]
                                },
                                'statistics.orders.weeklyOrders': {
                                    $exists: true,
                                    $gt: 0
                                }
                            }
                        },
                        {
                            $sort: {
                                'statistics.orders.weeklyOrders': -1
                            }
                        },
                        ...options,
                        {
                            $project: (0, formatAggregate_1.default)(this.allowedFields)
                        },
                    ]).toArray();
                    resolve(query);
                    if (!since) {
                        await this.client.redis.cache('leaderboardUsers', JSON.stringify(query), 600);
                    }
                    resolve(query);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUserRankHistory(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('user_rank_history').aggregate([
                    {
                        $match: {
                            userID
                        }
                    },
                    {
                        $sort: {
                            timestamp: -1
                        }
                    },
                    {
                        $lookup: {
                            from: 'ranks',
                            localField: 'oldRank',
                            foreignField: '_id',
                            as: 'oldRank'
                        }
                    },
                    {
                        $lookup: {
                            from: 'ranks',
                            localField: 'newRank',
                            foreignField: '_id',
                            as: 'newRank'
                        }
                    },
                    {
                        $unwind: {
                            path: '$oldRank',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $unwind: {
                            path: '$newRank',
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ]).toArray();
                resolve(query);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createUserRankHistory(userID, oldRank, newRank) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = {
                    _id: Snowflake_1.default.generate(),
                    userID,
                    oldRank,
                    newRank,
                    timestamp: Date.now()
                };
                await this.db.collection('user_rank_history').insertOne(data);
                resolve(data);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    // public deleteUserRankHistory(filter: object | string): Promise<RankHistoryOptions> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             if (typeof filter === 'string') filter = { id: filter };
    //             const rank = await this.getUserRankHistory(filter.userID);
    //             if (!rank) return reject({ statusCode: 400, code: 'rank_not_found', message: 'Rank not found' });
    //             await this.db.collection('user_rank_history').deleteOne(filter);
    //             await this.client.redis.sendGateway('userRankHistoryDelete', rank);
    //             resolve(rank);
    //         } catch (e) {
    //
    //             reject(e);
    //         }
    //     });
    // }
    hasPermissions(user, permissions) {
        if (!user || !user.permissions)
            return false;
        // if (!user || !user.rank || !user.rank.permissions) return false;
        let failed = [];
        const perms = new Permissions_1.default(user?.permissions || 0);
        for (const permission of permissions) {
            if (!perms.hasPermission(permission))
                failed.push(permission);
        }
        return failed.length <= 0;
    }
}
exports.default = UserController;
//# sourceMappingURL=User.js.map