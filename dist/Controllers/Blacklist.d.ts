import Controller from '../Structure/Controller';
import { BlacklistOptions } from 'com.foodexpressbot.types/types';
export default class Blacklist extends Controller {
    constructor(client: any, db: any);
    addBlacklist(id: string, blacklistedBy: string, type: 'user' | 'server', reason?: string, auto?: boolean): Promise<object>;
    removeBlacklist(id: string): Promise<object>;
    getBlacklist(id: string): Promise<BlacklistOptions>;
    getBlacklists(filter: object[]): Promise<BlacklistOptions[]>;
}
//# sourceMappingURL=Blacklist.d.ts.map