"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permissions = void 0;
const Controller_1 = __importDefault(require("../Structure/Controller"));
const axios_1 = __importDefault(require("axios"));
const eris_1 = __importDefault(require("eris"));
const querystring_1 = require("querystring");
var Permissions;
(function (Permissions) {
    Permissions[Permissions["createInstantInvite"] = 1] = "createInstantInvite";
    Permissions[Permissions["kickMembers"] = 2] = "kickMembers";
    Permissions[Permissions["banMembers"] = 4] = "banMembers";
    Permissions[Permissions["administrator"] = 8] = "administrator";
    Permissions[Permissions["manageChannels"] = 16] = "manageChannels";
    Permissions[Permissions["manageGuild"] = 32] = "manageGuild";
    Permissions[Permissions["addReactions"] = 64] = "addReactions";
    Permissions[Permissions["viewAuditLogs"] = 128] = "viewAuditLogs";
    Permissions[Permissions["voicePrioritySpeaker"] = 256] = "voicePrioritySpeaker";
    Permissions[Permissions["stream"] = 512] = "stream";
    Permissions[Permissions["readMessages"] = 1024] = "readMessages";
    Permissions[Permissions["sendMessages"] = 2048] = "sendMessages";
    Permissions[Permissions["sendTTSMessages"] = 4096] = "sendTTSMessages";
    Permissions[Permissions["manageMessages"] = 8192] = "manageMessages";
    Permissions[Permissions["embedLinks"] = 16384] = "embedLinks";
    Permissions[Permissions["attachFiles"] = 32768] = "attachFiles";
    Permissions[Permissions["readMessageHistory"] = 65536] = "readMessageHistory";
    Permissions[Permissions["mentionEveryone"] = 131072] = "mentionEveryone";
    Permissions[Permissions["externalEmojis"] = 262144] = "externalEmojis";
    Permissions[Permissions["viewGuildInsights"] = 524288] = "viewGuildInsights";
    Permissions[Permissions["voiceConnect"] = 1048576] = "voiceConnect";
    Permissions[Permissions["voiceSpeak"] = 2097152] = "voiceSpeak";
    Permissions[Permissions["voiceMuteMembers"] = 4194304] = "voiceMuteMembers";
    Permissions[Permissions["voiceDeafenMembers"] = 8388608] = "voiceDeafenMembers";
    Permissions[Permissions["voiceMoveMembers"] = 16777216] = "voiceMoveMembers";
    Permissions[Permissions["voiceUseVAD"] = 33554432] = "voiceUseVAD";
    Permissions[Permissions["changeNickname"] = 67108864] = "changeNickname";
    Permissions[Permissions["manageNicknames"] = 134217728] = "manageNicknames";
    Permissions[Permissions["manageRoles"] = 268435456] = "manageRoles";
    Permissions[Permissions["manageWebhooks"] = 536870912] = "manageWebhooks";
    Permissions[Permissions["manageEmojis"] = 1073741824] = "manageEmojis";
    Permissions[Permissions["all"] = 2147483647] = "all";
    Permissions[Permissions["allGuild"] = 2080899263] = "allGuild";
    Permissions[Permissions["allText"] = 805829713] = "allText";
    Permissions[Permissions["allVoice"] = 871367441] = "allVoice";
})(Permissions || (exports.Permissions = Permissions = {}));
class DiscordController extends Controller_1.default {
    bot;
    constructor(client, db) {
        super(client, db);
        this.bot = new eris_1.default.Client('Bot ' + this.client.clientOptions?.discord?.token, { restMode: true, defaultImageFormat: 'png', rest: { baseURL: '/api/v9' }, allowedMentions: { users: false, roles: false, everyone: false }, intents: 0 });
    }
    getAuthToken(code, refresh) {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = {
                    [refresh ? 'refresh_token' : 'code']: code,
                    client_id: this.client.clientOptions.discord.clientID,
                    client_secret: this.client.clientOptions.discord.clientSecret,
                    grant_type: refresh ? 'refresh_token' : 'authorization_code',
                };
                if (!refresh) {
                    Object.assign(payload, {
                        redirect_uri: this.client.clientOptions.discord.redirectURI,
                        scope: this.client.clientOptions.discord.scopes?.join('%')
                    });
                }
                const request = await this.request('/oauth2/token', 'POST', (0, querystring_1.stringify)(payload), { 'Content-Type': 'application/x-www-form-urlencoded' });
                resolve(request);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUser(id, tokenType, accessToken) {
        return new Promise(async (resolve, reject) => {
            try {
                let headers = {};
                if (id === '@me' && tokenType && accessToken)
                    headers['Authorization'] = tokenType + ' ' + accessToken;
                const request = await this.request('/users/' + id, 'GET', null, headers);
                resolve(request);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUserGuilds(id, tokenType, accessToken) {
        return new Promise(async (resolve, reject) => {
            try {
                let headers = {};
                if (id === '@me' && tokenType && accessToken)
                    headers['Authorization'] = tokenType + ' ' + accessToken;
                const request = await this.request('/users/' + id + '/guilds', 'GET', null, headers);
                resolve(request);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getGuilds(options) {
        return new Promise(async (resolve, reject) => {
            try {
                const guilds = await this.bot.getRESTGuilds(options);
                resolve(guilds);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getGuild(guildID, withCounts) {
        return new Promise(async (resolve, reject) => {
            try {
                const guild = await this.bot.getRESTGuild(guildID, withCounts);
                resolve(guild);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createChannel(guildID, name, type, options) {
        return new Promise(async (resolve, reject) => {
            try {
                const channel = await this.bot.createChannel(guildID, name, type, options);
                resolve(channel);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createMessage(channelID, content) {
        return new Promise(async (resolve, reject) => {
            try {
                const message = await this.bot.createMessage(channelID, content);
                resolve(message);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    banGuildMember(guildID, member, deleteDays = 0, reason) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.bot.banGuildMember(guildID, member, 0, reason);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    unbanGuildMember(guildID, member, reason) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.bot.unbanGuildMember(guildID, member, reason);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    sendUserDM(userID, content) {
        return new Promise(async (resolve, reject) => {
            try {
                const channel = await this.bot.getDMChannel(userID);
                if (!channel)
                    return resolve(null);
                const message = await channel.createMessage(content);
                resolve(message);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    addGuildMember(guildID, userID, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const member = await this.request('/guilds/' + guildID + '/members/' + userID, 'PUT', data);
                resolve(member);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    addMemberRole(guildID, userID, roleID, reason) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.bot.addGuildMemberRole(guildID, userID, roleID, reason);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    removeMemberRole(guildID, userID, roleID, reason) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.bot.removeGuildMemberRole(guildID, userID, roleID, reason);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getGuildBan(guildID, userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const ban = await this.bot.getGuildBan(guildID, userID);
                resolve(ban);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    crossPostMessage(channelID, messageID) {
        return new Promise(async (resolve, reject) => {
            try {
                const message = await this.bot.crosspostMessage(channelID, messageID);
                resolve(message);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    hasPermission(permission, permissions) {
        return !!(permissions & permission);
    }
    request(endpoint, method, data, headers) {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await (0, axios_1.default)({
                    url: 'https://discord.com/api/v9' + endpoint + (method === 'GET' && data ? '?' + (0, querystring_1.stringify)(Object(data)) : ''),
                    method,
                    data,
                    headers: {
                        'Authorization': 'Bot ' + this.client.clientOptions.discord.token,
                        'User-Agent': this.client.clientOptions.userAgent,
                        ...headers
                    }
                });
                resolve(request.data);
            }
            catch (e) {
                if (e.response)
                    reject(e.response.data);
                else if (e.request)
                    reject({ message: 'REQUEST ERROR', request: e.request });
                else
                    reject({ message: e.message });
            }
        });
    }
}
exports.default = DiscordController;
//# sourceMappingURL=Discord.js.map