import { Core } from '../Core';
import { Db } from 'mongodb';
export default class Cache extends Map {
    client: Core;
    db: Db;
    constructor(client: Core, db: Db);
    bulkSet(key: string, data: any): boolean;
    filter(func: Function): any[];
    find(func: Function): any;
    getAll(): any[];
    updateObject(key: string, data: object): this;
    map(func: Function): any[];
}
//# sourceMappingURL=Cache.d.ts.map