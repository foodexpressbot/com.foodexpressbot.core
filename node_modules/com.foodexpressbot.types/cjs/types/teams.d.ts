import { UserOptions } from './user';
export interface TeamOptions {
    _id: string;
    name: string;
    roleID: string;
    createdAt: number;
    createdBy: string | UserOptions;
    orders: number;
}
//# sourceMappingURL=teams.d.ts.map