import Controller from '../Structure/Controller';
import axios, { Method } from 'axios';
import Eris, { CategoryChannel, Client, Guild, Member, Message, TextChannel, TextVoiceChannel, User } from 'eris';
import { stringify } from 'querystring';

interface DiscordUser extends User {
    global_name?: string;
    public_flags?: number;
    premium_type?: number;
    flags?: number;
}

interface OAuth2Token {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
}

export enum Permissions {
    createInstantInvite = 1,
    kickMembers = 1 << 1,
    banMembers = 1 << 2,
    administrator = 1 << 3,
    manageChannels = 1 << 4,
    manageGuild = 1 << 5,
    addReactions = 1 << 6,
    viewAuditLogs = 1 << 7,
    voicePrioritySpeaker = 1 << 8,
    stream = 1 << 9,
    readMessages = 1 << 10,
    sendMessages = 1 << 11,
    sendTTSMessages = 1 << 12,
    manageMessages = 1 << 13,
    embedLinks = 1 << 14,
    attachFiles = 1 << 15,
    readMessageHistory = 1 << 16,
    mentionEveryone = 1 << 17,
    externalEmojis = 1 << 18,
    viewGuildInsights = 1 << 19,
    voiceConnect = 1 << 20,
    voiceSpeak = 1 << 21,
    voiceMuteMembers = 1 << 22,
    voiceDeafenMembers = 1 << 23,
    voiceMoveMembers = 1 << 24,
    voiceUseVAD = 1 << 25,
    changeNickname = 1 << 26,
    manageNicknames = 1 << 27,
    manageRoles = 1 << 28,
    manageWebhooks = 1 << 29,
    manageEmojis = 1 << 30,
    all = 0b1111111111111111111111111111111,
    allGuild = 0b1111100000010000000000010111111,
    allText = 0b0110000000001111111110001010001,
    allVoice = 0b0110011111100000000001100010001
}

export default class DiscordController extends Controller {
    private bot: Client;
    constructor(client, db) {
        super(client, db);

        this.bot = new Eris.Client('Bot ' + this.client.clientOptions?.discord?.token, { restMode: true, defaultImageFormat: 'png', rest: { baseURL: '/api/v9' }, allowedMentions: { users: false, roles: false, everyone: false }, intents: 0 });
    }

    public getAuthToken(code: string, refresh?: boolean): Promise<OAuth2Token> {
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

                const request = await this.request(
                    '/oauth2/token',
                    'POST',
                    stringify(payload),
                    { 'Content-Type': 'application/x-www-form-urlencoded' });
                resolve(request as OAuth2Token);
            } catch (e) {
                reject(e);
            }
        });
    }

    public getUser(id: string, tokenType?: string, accessToken?: string): Promise<DiscordUser> {
        return new Promise(async (resolve, reject) => {
            try {
                let headers = {};
                if (id === '@me' && tokenType && accessToken) headers['Authorization'] = tokenType + ' ' + accessToken;
                const request = await this.request('/users/' + id, 'GET', null, headers);
                resolve(request as DiscordUser);
            } catch (e) {
                reject(e);
            }
        });
    }

    public getUserGuilds(id: string, tokenType?: string, accessToken?: string): Promise<object[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let headers = {};
                if (id === '@me' && tokenType && accessToken) headers['Authorization'] = tokenType + ' ' + accessToken;
                const request = await this.request('/users/' + id + '/guilds', 'GET', null, headers);
                resolve(request as object[]);
            } catch (e) {
                reject(e);
            }
        });
    }

    public getGuilds(options: object): Promise<Guild[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const guilds = await this.bot.getRESTGuilds(options);
                resolve(guilds as Guild[]);
            } catch (e) {
                reject(e);
            }
        });
    }

    public getGuild(guildID: string, withCounts?: boolean): Promise<Guild> {
        return new Promise(async (resolve, reject) => {
            try {
                const guild = await this.bot.getRESTGuild(guildID, withCounts);
                resolve(guild as Guild);
            } catch (e) {
                reject(e);
            }
        });
    }

    public createChannel(guildID: string, name: string, type?: number, options?: any): Promise<CategoryChannel | TextChannel | TextVoiceChannel> {
        return new Promise(async (resolve, reject) => {
            try {
                const channel = await this.bot.createChannel(guildID, name, type, options);
                resolve(channel as CategoryChannel | TextChannel | TextVoiceChannel);
            } catch (e) {
                reject(e);
            }
        });
    }

    public createMessage(channelID: string, content: string | object): Promise<Message> {
        return new Promise(async (resolve, reject) => {
            try {
                const message = await this.bot.createMessage(channelID, content);
                resolve(message as Message);
            } catch (e) {
                reject(e);
            }
        });
    }

    public banGuildMember(guildID: string, member: string, deleteDays: number = 0, reason?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.bot.banGuildMember(guildID, member, 0, reason);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    public unbanGuildMember(guildID: string, member: string, reason?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.bot.unbanGuildMember(guildID, member, reason);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    public sendUserDM(userID: string, content: string | object): Promise<Message | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const channel = await this.bot.getDMChannel(userID);
                if (!channel) return resolve(null);
                const message = await channel.createMessage(content);
                resolve(message as Message);
            } catch (e) {
                reject(e);
            }
        });
    }

    public addGuildMember(guildID: string, userID: string, data: { access_token: string, nick?: string, roles?: string[], mute?: boolean, deaf?: boolean }): Promise<Member> {
        return new Promise(async (resolve, reject) => {
            try {
                const member = await this.request('/guilds/' + guildID + '/members/' + userID, 'PUT', data);
                resolve(member as Member);
            } catch (e) {
                reject(e);
            }
        });
    }

    public addMemberRole(guildID: string, userID: string, roleID: string, reason?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.bot.addGuildMemberRole(guildID, userID, roleID, reason);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }


    public removeMemberRole(guildID: string, userID: string, roleID: string, reason?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.bot.removeGuildMemberRole(guildID, userID, roleID, reason);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    public getGuildBan(guildID: string, userID: string): Promise<{  reason?: string, user: User }> {
        return new Promise(async (resolve, reject) => {
            try {
                const ban = await this.bot.getGuildBan(guildID, userID);
                resolve(ban);
            } catch (e) {
                reject(e);
            }
        });
    }

    public crossPostMessage(channelID: string, messageID): Promise<Message> {
        return new Promise(async (resolve, reject) => {
            try {
                const message = await this.bot.crosspostMessage(channelID, messageID);
                resolve(message as Message);
            } catch (e) {
                reject(e);
            }
        });
    }

    public hasPermission(permission: Permissions, permissions: number): boolean {
        return !!(permissions & permission);
    }

    private request(endpoint: string, method: Method, data?: object | string, headers?: object): Promise<object> {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await axios({
                    url: 'https://discord.com/api/v9' + endpoint + (method === 'GET' && data ? '?' + stringify(Object(data)) : ''),
                    method,
                    data,
                    headers: {
                        'Authorization': 'Bot ' + this.client.clientOptions.discord.token,
                        'User-Agent': this.client.clientOptions.userAgent,
                        ...headers
                    }
                });
                resolve(request.data);
            } catch (e) {
                if (e.response) reject(e.response.data);
                else if (e.request) reject({ message: 'REQUEST ERROR', request: e.request });
                else reject({ message: e.message });
            }
        });
    }
}
