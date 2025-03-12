"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
const dateUtil_1 = __importDefault(require("../Util/dateUtil"));
const generateUniqueID_1 = __importDefault(require("../Util/generateUniqueID"));
class WarningsController extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.collection = this.db.collection('user_warnings');
        this.allowedFields = ['userID', 'warning', 'issuedAt', 'expiresAt', 'issuedBy'];
    }
    getWarnings(filter, limit, sort) {
        return new Promise(async (resolve, reject) => {
            try {
                const warnings = await this.collection.aggregate([
                    { $match: { ...filter } },
                    { $limit: limit ?? 10 },
                    { $sort: sort ?? { issuedAt: -1 } },
                    { $project: (0, formatAggregate_1.default)(this.allowedFields, 'warningID') }
                ]).toArray();
                resolve(warnings);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    issueWarning(warning) {
        return new Promise(async (resolve, reject) => {
            try {
                const warningID = (0, generateUniqueID_1.default)();
                const data = {
                    _id: warningID,
                    ...warning
                };
                // warning.s
                await this.collection.insertOne(data);
                const expiryUnix = (0, dateUtil_1.default)(data.expiresAt).unix();
                // Increase the warning count for the user
                await this.client.controllers.statistics.incManagementStatistics(warning.issuedBy, 'warnings');
                try {
                    await this.client.controllers.discord.sendUserDM(warning.userID, ':warning: | You have received a warning.\n**Warning ID**: `' + warningID + '`\n**Reason**: ' + (warning.warning || '*No reason provided.*') + '\n**Expires**: <t:' + expiryUnix + ':F> (<t:' + expiryUnix + ':R>)' +
                        '\n\n**Something wrong?** 🔎 For future reference, if you are ever confused by an order, we encourage you to use the lookup or ask in one of the designated staff channels.\n\n**If you wish to discuss your warning(s), please do so by direct messaging Mod Mail.**');
                }
                catch {
                    // Fail silently
                }
                resolve({ warningID, ...data });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    removeWarning(query) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.collection.deleteOne(query);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = WarningsController;
//# sourceMappingURL=Warnings.js.map