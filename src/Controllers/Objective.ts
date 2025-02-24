
import escapeMarkdown from '../Util/escapeMarkdown';
import Controller from '../Structure/Controller';
import Snowflake from '../Structure/Snowflake';
import formatAggregate from '../Util/formatAggregate';
<<<<<<< HEAD
import { ClaimedObjectiveOptions, ObjectiveOptions, ObjectiveRewardType } from 'com.foodexpressbot.types/types';
=======
import { ClaimedObjectiveOptions, ObjectiveOptions, ObjectiveRewardType } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)

export default class Objective extends Controller {
  constructor(client, db) {
    super(client, db);
    this.collection = this.db.collection('objectives');
    this.allowedFields = ['userID', 'description', 'type', 'target', 'global', 'rewardType', 'rewardData'];
  }

  public getClaimedAchievements(userID: string): Promise<ClaimedObjectiveOptions[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const query = await this.db.collection('claimed_achievements').aggregate([
          {
            $match: {
              userID
            }
          },
          {
            $project: formatAggregate(['userID', 'objectiveID', 'timestamp'], true)
          }
        ]).toArray();

        resolve(query);
      } catch (e) {

        return reject(e);
      }
    });
  }

  public createObjective(data: ObjectiveOptions): Promise<object> {
    return new Promise(async (resolve, reject) => {
      try {
        const query = await this.db.collection<ObjectiveOptions>('objectives').insertOne({
          _id: Snowflake.generate(),
          ...data
        });
        resolve(query);
      } catch (e) {

        return reject(e);
      }
    });
  }

  public deleteObjective(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.db.collection<ObjectiveOptions>('objectives').deleteOne({ _id: id });
        await this.db.collection('claimed_achievements').deleteMany({ objectiveID: id });
        resolve();
      } catch (e) {
        return reject(e);
      }
    });
  }

  public completeObjectiveForUser(userID: string, objectiveID: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const objective = await this.getObjective(objectiveID);
        const user = await this.client.controllers.user.getUser(userID);
        if (!user) return reject({ statusCode: 400, code: 'invalid_user', message: 'Could not find user with the ID ' + userID });
        if (!objective) return reject({ statusCode: 400, code: 'invalid_objective', message: 'Could not find objective with the ID ' + objectiveID });
        if (!objective.global) return resolve();

        switch (objective.rewardType) {
          case ObjectiveRewardType.VD_CURRENCY:
            const amount = parseInt(objective.rewardData);
            if (!amount) return reject({ statusCode: 400, code: 'invalid_type', message: 'Reward data must be an integer' });
            await this.client.controllers.user.updateUser(user._id, { $inc: { money: amount } });
            break;
          case ObjectiveRewardType.VD_PERK:
            // todo
            break;
          case ObjectiveRewardType.CUSTOM:
            // todo
            break;
          case ObjectiveRewardType.VD_RANK:
            const rank = await this.client.controllers.rank.getRank(objective.rewardData);
            if (!rank) return reject({ statusCode: 400, code: 'invalid_rank', message: 'Could not find rank with the ID ' + objective.rewardData });
            await this.client.controllers.user.updateRanks(userID, [...user.ranks, rank._id], false, false);
            break;
        }
        this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.objectiveClaimLog, ':exclamation: | **' + escapeMarkdown(user.displayName || user.username) + '** (`' + user._id + '`) has claimed objective **' + objective._id + '**').catch(() => null);
        await this.db.collection('claimed_achievements').insertOne({
          userID: user._id,
          objectiveID: objective._id,
          timestamp: Date.now()
        });
        resolve();
      } catch (e) {

        reject(e);
      }
    });
  }

  public getObjectives(filter?: object): Promise<ObjectiveOptions[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const query = await this.db.collection<ObjectiveOptions>('objectives').aggregate([
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
            $project: formatAggregate([...this.allowedFields], true)
          }
        ]).toArray();

        resolve(query as unknown as ObjectiveOptions[]);
      } catch (e) {

        return reject(e);
      }
    });
  }

  public getObjective(id: string): Promise<ObjectiveOptions> {
    return new Promise(async (resolve, reject) => {
      try {
        const objective = await this.db.collection<ObjectiveOptions>('objectives').findOne({ _id: id });
        resolve(objective as unknown as ObjectiveOptions);
      } catch (e) {

        reject(e);
      }
    });
  }
}
