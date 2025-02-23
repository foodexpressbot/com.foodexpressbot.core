import { Core } from '../Core';
import { Db } from 'mongodb';

export default class Cache extends Map {
    public client: Core;
    public db: Db;

    constructor(client: Core, db: Db) {
        super();

        this.client = client;
        this.db = db;
    }

    public bulkSet(key: string, data: any): boolean {
        for (const value of data) {
            this.set(value[key], value);
        }

        return true;
    }

    public filter(func: Function): any[] {
        let result = [];
        const all = Array.from(this.values());
        for (let i = 0; i < all.length; i++) {
            if (func(all[i])) result.push(all[i]);
        }
        return result;
    }

    public find(func: Function): any {
        return this.filter(func)[0];
    }

    public getAll(): any[] {
        return [...this.values()];
    }

    public updateObject(key: string, data: object): this {
        const current = this.get(key);

        return this.set(key, { ...current, ...data });
    }

    public map(func: Function): any[] {
        const values = Array.from(this.values());
        let result = [];
        for (let i = 0; i < values.length; i++) {
            result.push(func(values[i]));
        }
        return result;
    }
}
