"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Snowflake_1 = __importDefault(require("../Structure/Snowflake"));
const Controller_1 = __importDefault(require("../Structure/Controller"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
const Constants_1 = require("../Constants");
/**
 * Controller for the teams feature
 */
class Teams extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.collection = db.collection('teams');
        this.allowedFields = ['name', 'roleID', 'orders', 'createdAt'];
    }
    /**
     *
     * @param data The data for team to create
     * @returns Promise
     */
    createTeam(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('teams').insertOne({
                    _id: Snowflake_1.default.generate(),
                    createdAt: Date.now(),
                    orders: 0,
                    ...data
                });
                // @ts-ignore This does exist???
                resolve(query.ops[0]);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    incrementOrders(teamID, amount = 1) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.updateTeam({ _id: teamID }, { $inc: { orders: amount } });
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    setOrders(teamID, amount) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.updateTeam(teamID, {
                    $set: {
                        orders: amount
                    }
                });
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    updateTeam(filter, data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { _id: filter };
                const query = await this.collection.updateOne(filter, data);
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    /**
     *
     * @param id The id of the team to delete
     * @returns Promise
     */
    deleteTeam(id) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection('teams').deleteOne({ _id: id });
                await this.db.collection('users').updateMany({ team: id }, { $set: { team: null } });
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    /**
     *
     * @param id The id of the team to fetch
     * @returns The team fetched
     */
    getTeam(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.getTeams({ _id: id }, null, 1);
                resolve(query[0] || null);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     *
     * @param filter The aggregation pipeline
     * @param sort The sort object
     * @param limit The limit of the query
     * @returns An array of resulting teams
     */
    getTeams(filter, sort, limit) {
        return new Promise(async (resolve, reject) => {
            try {
                const aggregation = [
                    {
                        $match: {
                            ...filter
                        }
                    }
                ];
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
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy'
                    }
                });
                aggregation.push({
                    $unwind: {
                        path: '$createdBy',
                        preserveNullAndEmptyArrays: true
                    }
                });
                aggregation.push({
                    $project: (0, formatAggregate_1.default)([...this.allowedFields, ...(0, Constants_1.USER_AGGREGATE_FIELDS)('createdBy')], true)
                });
                const query = await this.collection.aggregate(aggregation).toArray();
                resolve(query);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     * This method should be used when accepting new Kitchen Staff members, to randomly assign them to a team.
     * @returns Randomly selected team from the database
     */
    getRandomTeam() {
        return new Promise(async (resolve, reject) => {
            try {
                // Find the team with the lowest amount of users assigned to it
                const query = await this.collection.aggregate([
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: 'team',
                            as: 'users'
                        }
                    },
                    {
                        $project: {
                            _id: true,
                            userCount: {
                                $size: '$users'
                            }
                        }
                    },
                    {
                        $sort: {
                            userCount: 1
                        }
                    },
                    {
                        $limit: 1
                    }
                ]).toArray();
                if (!query.length)
                    return reject({ statusCode: 404, code: 'no_teams', message: 'No teams currently available' });
                resolve(query[0]._id);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     *
     * @param userID Id of the user to add the team to
     * @param teamID Id of the team to add to the user
     * @returns void
     */
    updateUserTeam(userID, teamID) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.client.controllers.user.getUser(userID);
                if (!user)
                    reject({ statusCode: 404, code: 'user_not_found', message: 'User not found' });
                let userTeam = null;
                let newTeam = null;
                if (user.team) {
                    userTeam = await this.getTeam(user.team);
                }
                if (teamID) {
                    newTeam = await this.getTeam(teamID);
                }
                // Should this error? It might cause issues if the team does not exist and we cant update it?
                // if (!userTeam) reject({ statusCode: 404, code: 'team_not_found', message: 'User team not found' });
                if (user.team && !teamID && userTeam?.roleID) {
                    this.client.controllers.discord.removeMemberRole(this.client.clientOptions.discord.guilds.main, user._id, userTeam.roleID, '[Automatic] Team has been removed').catch(() => null);
                }
                else {
                    if (userTeam?.roleID) {
                        await this.client.controllers.discord.removeMemberRole(this.client.clientOptions.discord.guilds.main, user._id, userTeam.roleID, '[Automatic] Team has been removed').catch(() => null);
                    }
                    if (newTeam?.roleID) {
                        await this.client.controllers.discord.addMemberRole(this.client.clientOptions.discord.guilds.main, user._id, newTeam.roleID, '[Automatic] Team has been added').catch(() => null);
                    }
                }
                await this.client.controllers.user.updateUser({ _id: user._id }, { $set: { team: teamID } });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = Teams;
//# sourceMappingURL=Teams.js.map