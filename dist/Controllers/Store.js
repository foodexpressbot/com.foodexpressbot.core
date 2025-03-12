"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const types_1 = require("com.foodexpressbot.types/types");
class ShopController extends Controller_1.default {
    shopItems;
    constructor(client, db) {
        super(client, db);
        this.shopItems = [
            {
                id: 1,
                name: 'Cancel Orders',
                description: 'Cancel all orders placed by you.\nNOTE: This does not remove your order from logs.',
                prices: {
                    realMoney: 0,
                    virtualMoney: 20000
                },
                specialOffer: {
                    startDate: 1700769551897,
                    endDate: 1701129599000,
                    prices: {
                        realMoney: 0,
                        virtualMoney: 10000
                    }
                },
                purchaseAction: async (user) => await this.addPerk(user, types_1.PerkTypes.CancelOrders),
                hasPerk: (user) => {
                    return user?.perks?.includes(types_1.PerkTypes.CancelOrders);
                }
            },
            {
                id: 2,
                name: 'Priority Orders',
                description: 'Push your orders to the top of the queue.',
                prices: {
                    realMoney: 0,
                    virtualMoney: 25000
                },
                specialOffer: {
                    startDate: 1700769551897,
                    endDate: 1701129599000,
                    prices: {
                        realMoney: 0,
                        virtualMoney: 12500
                    }
                },
                purchaseAction: async (user) => await this.addPerk(user, types_1.PerkTypes.PriorityOrders),
                hasPerk: (user) => {
                    return user?.perks?.includes(types_1.PerkTypes.PriorityOrders);
                }
            },
            {
                id: 3,
                name: 'Order Multiplier',
                description: 'Be able to send multiple orders at a time!',
                prices: {
                    realMoney: 0,
                    virtualMoney: 30000
                },
                specialOffer: {
                    startDate: 1700769551897,
                    endDate: 1701129599000,
                    prices: {
                        realMoney: 0,
                        virtualMoney: 15000
                    }
                },
                purchaseAction: async (user) => await this.addPerk(user, types_1.PerkTypes.OrderMultiplier),
                hasPerk: (user) => {
                    return user?.perks?.includes(types_1.PerkTypes.OrderMultiplier);
                }
            },
            {
                id: 4,
                name: 'Faster Orders',
                description: 'Speed up your order prepare time from 3 minutes down to 1 minute 30 seconds!',
                prices: {
                    realMoney: 0,
                    virtualMoney: 30000
                },
                specialOffer: {
                    startDate: 1700769551897,
                    endDate: 1701129599000,
                    prices: {
                        realMoney: 0,
                        virtualMoney: 15000
                    }
                },
                purchaseAction: async (user) => await this.addPerk(user, types_1.PerkTypes.FasterOrder),
                hasPerk: (user) => {
                    return user?.perks?.includes(types_1.PerkTypes.FasterOrder);
                }
            },
            {
                id: 5,
                name: 'Daily Multiplier',
                description: 'Potentially increase your daily money.',
                prices: {
                    realMoney: 0,
                    virtualMoney: 5000
                },
                specialOffer: {
                    startDate: 1700769551897,
                    endDate: 1701129599000,
                    prices: {
                        realMoney: 0,
                        virtualMoney: 2500
                    }
                },
                purchaseAction: async (user) => await this.addPerk(user, types_1.PerkTypes.DailyMultiplier),
                hasPerk: (user) => {
                    return user?.perks?.includes(types_1.PerkTypes.DailyMultiplier);
                }
            },
            {
                id: 6,
                name: 'Stickers & External Emojis',
                description: 'The additional permissions to use stickers and external emojis in the Discord server. PLEASE NOTE: Leaving the server will result in losing this perk.',
                prices: {
                    realMoney: 0,
                    virtualMoney: 150
                },
                // specialOffer: {
                //     startDate: 1700769551897,
                //     endDate: 1701129599000,
                //     prices: {
                //         realMoney: 0,
                //         virtualMoney: 2500
                //     }
                // },
                purchaseAction: async (user) => this.addDiscordRole(user, this.client.clientOptions.discord.roles.stickersAndEmojis),
                hasPerk: (user) => {
                    return false;
                }
            },
        ];
    }
    getItems() {
        return this.shopItems;
    }
    getItem(id) {
        const data = this.shopItems.find(item => item.id === id);
        if (!data)
            return null;
        const item = Object.assign({}, data);
        if (item.specialOffer && item.specialOffer.startDate <= Date.now() && item.specialOffer.endDate >= Date.now()) {
            item.prices = item.specialOffer.prices;
        }
        return item;
    }
    async addPerk(user, perk) {
        return new Promise(async (resolve, reject) => {
            try {
                if (user.perks?.includes(perk))
                    return resolve(false);
                await this.client.controllers.user.updateUser(user.id, { $push: { perks: perk } });
                resolve(true);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    async addDiscordRole(user, roleID) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.client.controllers.discord.addMemberRole(this.client.clientOptions.discord.guilds.main, user._id, roleID, 'Automated: Store perk');
                resolve(true);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    purchaseCancelOrders(user) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.client.controllers.user.updateUser(user.id, { $push: { perks: types_1.PerkTypes.CancelOrders } });
                resolve(true);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = ShopController;
//# sourceMappingURL=Store.js.map