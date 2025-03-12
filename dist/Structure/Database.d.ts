import { Db } from 'mongodb';
export default class Database {
    url: string;
    database: string;
    db: Db;
    constructor(url: any, database: any);
    connect(): Promise<Db>;
}
//# sourceMappingURL=Database.d.ts.map