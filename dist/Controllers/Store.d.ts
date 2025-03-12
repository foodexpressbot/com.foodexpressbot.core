import Controller from '../Structure/Controller';
import { UserOptions, PerkTypes, StoreItem } from 'com.foodexpressbot.types/types';
export default class ShopController extends Controller {
    shopItems: StoreItem[];
    constructor(client: any, db: any);
    getItems(): StoreItem[];
    getItem(id: number): StoreItem | null;
    addPerk(user: UserOptions, perk: PerkTypes): Promise<boolean>;
    addDiscordRole(user: UserOptions, roleID: string): Promise<boolean>;
    purchaseCancelOrders(user: UserOptions): Promise<boolean>;
}
//# sourceMappingURL=Store.d.ts.map