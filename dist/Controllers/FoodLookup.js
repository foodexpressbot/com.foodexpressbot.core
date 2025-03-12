"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const Snowflake_1 = __importDefault(require("../Structure/Snowflake"));
const formatAggregate_1 = __importDefault(require("../Util/formatAggregate"));
class FoodLookup extends Controller_1.default {
    constructor(client, db) {
        super(client, db);
        this.allowedFields = ['id', 'food', 'description', 'preparable', 'chefDiscretion', 'addedAt'];
    }
    addToLookup(data, logInDiscord = true) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('food_lookup').insertOne({ id: Snowflake_1.default.generate(), ...data });
                if (logInDiscord) {
                    this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.foodLookupLog, ':hamburger: | An item has been added to the lookup:' +
                        '\n\n**Food**: ' + (data.food || 'N/A') +
                        '\n**Description**: ' + (data.description || 'N/A') +
                        '\n**Preparable**: ' + (data.preparable ? 'Yes' : 'No') +
                        '\n**Chef Discretion**: ' + (data.chefDiscretion ? 'Yes' : 'No') +
                        '\n*Added by: <@' + data.addedBy + '>*').catch(() => null);
                }
                // @ts-ignore
                delete query.ops[0]._id;
                // @ts-ignore
                resolve(query.ops[0]);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    editLookup(filter, data, logInDiscord = true) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { id: filter };
                const lookup = await this.getLookup(filter);
                if (!lookup)
                    return reject({ statusCode: 404, code: 'lookup_not_found', message: 'Lookup does not exist' });
                const query = await this.db.collection('food_lookup').findOneAndUpdate(filter, { $set: data });
                if (logInDiscord) {
                    this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.foodLookupLog, ':hamburger: | An item has been edited on the food lookup:\n\n**Item**: ' + (data.food || 'N/A') +
                        (lookup.food !== data.food ? '\n**Food**: ' + (lookup.food || 'N/A') + ' -> ' + (data.food || 'N/A') : '') +
                        (lookup.description !== data.description ? '\n**Description**: ' + (lookup.description || 'N/A') + ' -> ' + (data.description || 'N/A') : '') +
                        (lookup.preparable !== data.preparable ? '\n**Preparable**: ' + (lookup.preparable ? 'Yes' : 'No') + ' -> ' + (data.preparable ? 'Yes' : 'No') : '') +
                        (lookup.chefDiscretion !== data.chefDiscretion ? '\n**Chef Discretion**: ' + (lookup.chefDiscretion ? 'Yes' : 'No') + ' -> ' + (data.chefDiscretion ? 'Yes' : 'No') : '') +
                        '\n*Edited by: <@' + data.editedBy + '>*').catch(() => null);
                }
                delete query.value._id;
                resolve(query.value);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    deleteLookup(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { id: filter };
                const lookup = await this.getLookup(filter);
                if (!lookup)
                    return reject({ statusCode: 404, code: 'lookup_not_found', message: 'Lookup does not exist' });
                await this.db.collection('food_lookup').deleteOne({ id: lookup.id });
                this.client.controllers.discord.createMessage(this.client.clientOptions.discord.channels.foodLookupLog, ':hamburger: | `' + lookup.food + '` has been removed from the food lookup.').catch(() => null);
                resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    getLookups(filter, limit = 250, fields = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = await this.db.collection('food_lookup').aggregate([
                    { $match: { ...filter } },
                    { $limit: limit },
                    { $project: (0, formatAggregate_1.default)([...this.allowedFields, ...fields]) }
                ]).toArray();
                resolve(query);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getLookup(filter, fields = []) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string')
                    filter = { id: filter };
                const query = await this.db.collection('food_lookup').aggregate([
                    { $match: { ...filter } },
                    { $project: (0, formatAggregate_1.default)([...this.allowedFields, ...fields]) }
                ]).toArray();
                resolve(query[0]);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = FoodLookup;
//# sourceMappingURL=FoodLookup.js.map