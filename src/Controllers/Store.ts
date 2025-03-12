import Controller from '../Structure/Controller';
import { UserOptions, PerkTypes, StoreItem } from 'com.foodexpressbot.types/types';

export default class ShopController extends Controller {
    public shopItems: StoreItem[];
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
                purchaseAction: async (user: UserOptions) => await this.addPerk(user, PerkTypes.CancelOrders),
                hasPerk: (user: UserOptions) => {
                    return user?.perks?.includes(PerkTypes.CancelOrders);
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
                purchaseAction: async (user: UserOptions) => await this.addPerk(user, PerkTypes.PriorityOrders),
                hasPerk: (user: UserOptions) => {
                    return user?.perks?.includes(PerkTypes.PriorityOrders);
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
                purchaseAction: async (user: UserOptions) => await this.addPerk(user, PerkTypes.OrderMultiplier),
                hasPerk: (user: UserOptions) => {
                    return user?.perks?.includes(PerkTypes.OrderMultiplier);
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
                purchaseAction: async (user: UserOptions) => await this.addPerk(user, PerkTypes.FasterOrder),
                hasPerk: (user: UserOptions) => {
                    return user?.perks?.includes(PerkTypes.FasterOrder);
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
                purchaseAction: async (user: UserOptions) => await this.addPerk(user, PerkTypes.DailyMultiplier),
                hasPerk: (user: UserOptions) => {
                    return user?.perks?.includes(PerkTypes.DailyMultiplier);
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
                purchaseAction: async (user: UserOptions) => this.addDiscordRole(user, this.client.clientOptions.discord.roles.stickersAndEmojis),
                hasPerk: (user: UserOptions) => {
                    return false;
                }
            },
        ];
    }

    public getItems(): StoreItem[] {
        return this.shopItems;
    }

    public getItem(id: number): StoreItem | null {
        const data = this.shopItems.find(item => item.id === id);
        if (!data) return null;
        const item = Object.assign({}, data);

        if (item.specialOffer && item.specialOffer.startDate <= Date.now() && item.specialOffer.endDate >= Date.now()) {
            item.prices = item.specialOffer.prices;
        }

        return item;
    }

    async addPerk(user: UserOptions, perk: PerkTypes): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (user.perks?.includes(perk)) return resolve(false);
                await this.client.controllers.user.updateUser(user.id, { $push: { perks: perk } });
                resolve(true);
            } catch (e) {

                reject(e);
            }
        });
    }

    async addDiscordRole(user: UserOptions, roleID: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.client.controllers.discord.addMemberRole(this.client.clientOptions.discord.guilds.main, user._id, roleID, 'Automated: Store perk');
                resolve(true);
            } catch (e) {
                reject(e);
            }
        });
    }

    public purchaseCancelOrders(user: UserOptions): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.client.controllers.user.updateUser(user.id, { $push: { perks: PerkTypes.CancelOrders } });
                resolve(true);
            } catch (e) {

                reject(e);
            }
        });
    }
}
