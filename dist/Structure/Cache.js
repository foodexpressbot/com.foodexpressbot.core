"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cache extends Map {
    client;
    db;
    constructor(client, db) {
        super();
        this.client = client;
        this.db = db;
    }
    bulkSet(key, data) {
        for (const value of data) {
            this.set(value[key], value);
        }
        return true;
    }
    filter(func) {
        let result = [];
        const all = Array.from(this.values());
        for (let i = 0; i < all.length; i++) {
            if (func(all[i]))
                result.push(all[i]);
        }
        return result;
    }
    find(func) {
        return this.filter(func)[0];
    }
    getAll() {
        return [...this.values()];
    }
    updateObject(key, data) {
        const current = this.get(key);
        return this.set(key, { ...current, ...data });
    }
    map(func) {
        const values = Array.from(this.values());
        let result = [];
        for (let i = 0; i < values.length; i++) {
            result.push(func(values[i]));
        }
        return result;
    }
}
exports.default = Cache;
//# sourceMappingURL=Cache.js.map