"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const escapeMarkdown_1 = __importDefault(require("../Util/escapeMarkdown"));
const Controller_1 = __importDefault(require("../Structure/Controller"));
const Snowflake_1 = __importDefault(require("../Structure/Snowflake"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
const types_1 = require("com.foodexpressbot.types/types");
class Objective extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.collection = this.db.collection('objectives');
        this.allowedFields = ['userID', 'description', 'type', 'target', 'global', 'rewardType', 'rewardData'];
    }
    getClaimedAchievements(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('claimed_achievements').aggregate([
                    {
                        $match: {
                            userID
                        }
                    },
                    {
                        $project: (0, formatAggregate_1.default)(['userID', 'objectiveID', 'timestamp'], true)
                    }
                ]).toArray();
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    createObjective(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('objectives').insertOne({
                    _id: Snowflake_1.default.generate(),
                    ...data
                });
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    deleteObjective(id) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection('objectives').deleteOne({ _id: id });
                await this.db.collection('claimed_achievements').deleteMany({ objectiveID: id });
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    completeObjectiveForUser(userID, objectiveID) {
        return new Promise(async (resolve, reject) => {
            try {
                const objective = await this.getObjective(objectiveID);
                const user = await this.client.controllers.user.getUser(userID);
                if (!user)
                    return reject({ statusCode: 400, code: 'invalid_user', message: 'Could not find user with the ID ' + userID });
                if (!objective)
                    return reject({ statusCode: 400, code: 'invalid_objective', message: 'Could not find objective with the ID ' + objectiveID });
                if (!objective.global)
                    return resolve();
                switch (objective.rewardType) {
                    case types_1.ObjectiveRewardType.VD_CURRENCY:
                        const amount = parseInt(objective.rewardData);
                        if (!amount)
                            return reject({ statusCode: 400, code: 'invalid_type', message: 'Reward data must be an integer' });
                        await this.client.controllers.user.updateUser(user._id, { $inc: { money: amount } });
                        break;
                    case types_1.ObjectiveRewardType.VD_PERK:
                        // todo
                        break;
                    case types_1.ObjectiveRewardType.CUSTOM:
                        // todo
                        break;
                    case types_1.ObjectiveRewardType.VD_RANK:
                        const rank = await this.client.controllers.rank.getRank(objective.rewardData);
                        if (!rank)
                            return reject({ statusCode: 400, code: 'invalid_rank', message: 'Could not find rank with the ID ' + objective.rewardData });
                        await this.client.controllers.user.updateRanks(userID, [...user.ranks, rank._id], false, false);
                        break;
                }
                this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.objectiveClaimLog, ':exclamation: | **' + (0, escapeMarkdown_1.default)(user.displayName || user.username) + '** (`' + user._id + '`) has claimed objective **' + objective._id + '**').catch(() => null);
                await this.db.collection('claimed_achievements').insertOne({
                    userID: user._id,
                    objectiveID: objective._id,
                    timestamp: Date.now()
                });
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getObjectives(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('objectives').aggregate([
                    {
                        $match: {
                            ...filter
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userID',
                            foreignField: '_id',
                            as: 'createdBy'
                        }
                    },
                    {
                        $unwind: {
                            path: '$createdBy',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: (0, formatAggregate_1.default)([...this.allowedFields], true)
                    }
                ]).toArray();
                resolve(query);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getObjective(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const objective = await this.db.collection('objectives').findOne({ _id: id });
                resolve(objective);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = Objective;
//# sourceMappingURL=Objective.js.map