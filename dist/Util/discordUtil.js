"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_ID_REGEX = void 0;
exports.SERVER_ID_REGEX = /^(?:[0-9]{15,21})$/;
class DiscordUtil {
    static getDiscordUsername(user) {
        if (user.discriminator === '0') {
            return user.username;
        }
        return user.username + '#' + user.discriminator;
    }
    static isServerID(serverID) {
        return exports.SERVER_ID_REGEX.test(serverID);
    }
}
exports.default = DiscordUtil;
//# sourceMappingURL=discordUtil.js.map