"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Encrypyter {
    hash;
    iv;
    constructor(key) {
        // @ts-ignore
        this.hash = crypto_1.default.createHash('md5').update(key, 'utf-8').digest('hex').toUpperCase();
        this.iv = Buffer.alloc(16);
    }
    encrypt(data) {
        return new Promise((resolve, reject) => {
            try {
                if (!data)
                    return null;
                let cipher = crypto_1.default.createCipheriv('aes-256-cbc', this.hash, this.iv);
                resolve(cipher.update(data, 'utf8', 'hex') + cipher.final('hex'));
            }
            catch (e) {
                reject(e);
            }
        });
    }
    decrypt(data) {
        return new Promise((resolve, reject) => {
            try {
                if (!data)
                    return null;
                let cipher = crypto_1.default.createDecipheriv('aes-256-cbc', this.hash, this.iv);
                resolve(cipher.update(data, 'hex', 'utf8') + cipher.final('utf8'));
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.default = Encrypyter;
//# sourceMappingURL=Encrypyter.js.map