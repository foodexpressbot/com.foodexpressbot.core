"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
exports.default = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await (0, axios_1.default)({
                method: 'POST',
                url: 'https://paste.hep.gg/documents',
                data
            });
            resolve('https://paste.hep.gg/' + result.data.key);
        }
        catch (e) {
            reject(e);
        }
    });
};
//# sourceMappingURL=uploadToHastebin.js.map