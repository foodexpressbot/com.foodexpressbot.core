"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ranks_1 = __importDefault(require("./Ranks"));
class Caches {
    client;
    ranks;
    constructor(client, db) {
        this.ranks = new Ranks_1.default(client, db);
    }
}
exports.default = Caches;
//# sourceMappingURL=Index.js.map