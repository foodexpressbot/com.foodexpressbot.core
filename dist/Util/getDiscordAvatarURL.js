"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (userID, avatar, size) => {
    if (!avatar)
        return 'https://cdn.discordapp.com/embed/avatars/0.png';
    return 'https://cdn.discordapp.com/avatars/' + userID + '/' + avatar + '.' + (avatar.startsWith('a_') ? 'gif' : 'png') + '?size=' + (size || '128');
};
//# sourceMappingURL=getDiscordAvatarURL.js.map