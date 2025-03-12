import Controller from '../Structure/Controller';
import { FoodLookupOptions } from 'com.foodexpressbot.types/types';
export default class FoodLookup extends Controller {
    allowedFields: string[];
    constructor(client: any, db: any);
    addToLookup(data: FoodLookupOptions, logInDiscord?: boolean): Promise<FoodLookupOptions>;
    editLookup(filter: object | string, data: FoodLookupOptions, logInDiscord?: boolean): Promise<FoodLookupOptions>;
    deleteLookup(filter: object | string): Promise<void>;
    getLookups(filter?: object, limit?: number, fields?: string[]): Promise<FoodLookupOptions[]>;
    getLookup(filter: string | object, fields?: string[]): Promise<FoodLookupOptions>;
}
//# sourceMappingURL=FoodLookup.d.ts.map