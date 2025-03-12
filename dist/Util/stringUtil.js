"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringUtil {
    static generateRandomString(length = 7) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}
exports.default = StringUtil;
//# sourceMappingURL=stringUtil.js.map