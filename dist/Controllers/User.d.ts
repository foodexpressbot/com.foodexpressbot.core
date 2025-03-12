import Controller from '../Structure/Controller';
import { UserOptions, BanOptions, RankHistoryOptions, RankOptions, Permissions } from 'com.foodexpressbot.types/types';
export default class UserController extends Controller {
    constructor(client: any, db: any);
    private init;
    createOrUpdateUser(filter: string | object, data: object, rawData?: object, upsert?: boolean): Promise<void>;
    updateUser(filter: string | object, data: object, upsert?: boolean): Promise<void>;
    getUser(filter: string | object, fields?: string[], allowVanity?: boolean): Promise<UserOptions | null>;
    syncWithDiscord(user: UserOptions, force?: boolean): Promise<object>;
    getUsers(filter?: object, sort?: object, limit?: object, fields?: string[]): Promise<UserOptions[]>;
    getTotalUsers(filter?: object): Promise<number>;
    getUsersPaginated(filter?: any[], sort?: object, skip?: number, limit?: number, fields?: string[]): Promise<{
        totalUsers: number;
        users: UserOptions[];
    }>;
    getUserSitemap(skip: number, limit: number): Promise<UserOptions[]>;
    getTeam(bypassCache?: boolean): Promise<RankOptions[]>;
    updateRanks(filter: object | string, ranks: string[], announceToLog?: boolean, logToHistory?: boolean | null): Promise<string[]>;
    getBan(filter: string | object): Promise<BanOptions | null>;
    banUser(userID: string, bannedBy: UserOptions | null, reason?: string, expiry?: number | null, silent?: boolean): Promise<object>;
    unbanUser(userID: string, staffMember?: UserOptions | null, silent?: boolean): Promise<void>;
    removeStaff(filter: string | object, removedBy: UserOptions, reason?: string, nextApplicationAllowed?: number | null): Promise<boolean>;
    getLeaderboard(filter?: object, since?: number | null, limit?: number, bypassCache?: boolean): Promise<UserOptions[]>;
    getUserRankHistory(userID: string): Promise<RankHistoryOptions[]>;
    createUserRankHistory(userID: string, oldRank: string | null, newRank: string | null): Promise<RankHistoryOptions>;
    hasPermissions(user: UserOptions, permissions: Permissions[]): boolean;
}
//# sourceMappingURL=User.d.ts.map