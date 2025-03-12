import { WarningOptions } from 'com.foodexpressbot.types/types';
import Controller from '../Structure/Controller';
import formatAggregate from '../Util/formatAggregate';
import dateUtil from '../Util/dateUtil';
import generateUniqueID from '../Util/generateUniqueID';

export default class WarningsController extends Controller {
	constructor(client, db) {
		super(client, db);
		this.collection = this.db.collection('user_warnings');
		this.allowedFields = ['userID', 'warning', 'issuedAt', 'expiresAt', 'issuedBy'];
	}

	public getWarnings(filter: object, limit?: number, sort?: object): Promise<WarningOptions[]> {
		return new Promise(async (resolve, reject) => {
			try {
				const warnings = await this.collection.aggregate([
					{ $match: { ...filter } },
					{ $limit: limit ?? 10 },
					{ $sort: sort ?? { issuedAt: -1 } },
					{ $project: formatAggregate(this.allowedFields, 'warningID') }
				]).toArray();
				resolve(warnings);
			} catch (e) {
				reject(e);
			}
		});
	}

	public issueWarning(warning: WarningOptions): Promise<WarningOptions> {
		return new Promise(async (resolve, reject) => {
			try {
				const warningID = generateUniqueID() as any;
				const data = {
					_id: warningID,
					...warning
				};

				// warning.s
				await this.collection.insertOne(data);

				const expiryUnix = dateUtil(data.expiresAt).unix();

				// Increase the warning count for the user
				await this.client.controllers.statistics.incManagementStatistics(warning.issuedBy, 'warnings');

				try {
				await this.client.controllers.discord.sendUserDM(warning.userID, ':warning: | You have received a warning.\n**Warning ID**: `' + warningID + '`\n**Reason**: ' + (warning.warning || '*No reason provided.*') + '\n**Expires**: <t:' + expiryUnix + ':F> (<t:' + expiryUnix + ':R>)' +
					'\n\n**Something wrong?** 🔎 For future reference, if you are ever confused by an order, we encourage you to use the lookup or ask in one of the designated staff channels.\n\n**If you wish to discuss your warning(s), please do so by direct messaging Mod Mail.**');
				} catch {
					// Fail silently
				}

				resolve({ warningID, ...data });
			} catch (e) {
				reject(e);
			}
		});
	}

	public removeWarning(query: object): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {

				await this.collection.deleteOne(query);

				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}
}
