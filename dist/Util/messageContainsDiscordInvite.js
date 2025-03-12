"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const REGEX = /(http(s)?:\/\/(www.)?)?(discord.gg|discord.io|discord.me|discord.link|invite.gg)\/\w+/;
exports.default = (message) => {
    return REGEX.test(message);
};
//# sourceMappingURL=messageContainsDiscordInvite.js.map