import Controller from '../Structure/Controller';
import { CategoryChannel, Guild, Member, Message, TextChannel, TextVoiceChannel, User } from 'eris';
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
export declare enum Permissions {
    createInstantInvite = 1,
    kickMembers = 2,
    banMembers = 4,
    administrator = 8,
    manageChannels = 16,
    manageGuild = 32,
    addReactions = 64,
    viewAuditLogs = 128,
    voicePrioritySpeaker = 256,
    stream = 512,
    readMessages = 1024,
    sendMessages = 2048,
    sendTTSMessages = 4096,
    manageMessages = 8192,
    embedLinks = 16384,
    attachFiles = 32768,
    readMessageHistory = 65536,
    mentionEveryone = 131072,
    externalEmojis = 262144,
    viewGuildInsights = 524288,
    voiceConnect = 1048576,
    voiceSpeak = 2097152,
    voiceMuteMembers = 4194304,
    voiceDeafenMembers = 8388608,
    voiceMoveMembers = 16777216,
    voiceUseVAD = 33554432,
    changeNickname = 67108864,
    manageNicknames = 134217728,
    manageRoles = 268435456,
    manageWebhooks = 536870912,
    manageEmojis = 1073741824,
    all = 2147483647,
    allGuild = 2080899263,
    allText = 805829713,
    allVoice = 871367441
}
export default class DiscordController extends Controller {
    private bot;
    constructor(client: any, db: any);
    getAuthToken(code: string, refresh?: boolean): Promise<OAuth2Token>;
    getUser(id: string, tokenType?: string, accessToken?: string): Promise<DiscordUser>;
    getUserGuilds(id: string, tokenType?: string, accessToken?: string): Promise<object[]>;
    getGuilds(options: object): Promise<Guild[]>;
    getGuild(guildID: string, withCounts?: boolean): Promise<Guild>;
    createChannel(guildID: string, name: string, type?: number, options?: any): Promise<CategoryChannel | TextChannel | TextVoiceChannel>;
    createMessage(channelID: string, content: string | object): Promise<Message>;
    banGuildMember(guildID: string, member: string, deleteDays?: number, reason?: string): Promise<void>;
    unbanGuildMember(guildID: string, member: string, reason?: string): Promise<void>;
    sendUserDM(userID: string, content: string | object): Promise<Message | null>;
    addGuildMember(guildID: string, userID: string, data: {
        access_token: string;
        nick?: string;
        roles?: string[];
        mute?: boolean;
        deaf?: boolean;
    }): Promise<Member>;
    addMemberRole(guildID: string, userID: string, roleID: string, reason?: string): Promise<void>;
    removeMemberRole(guildID: string, userID: string, roleID: string, reason?: string): Promise<void>;
    getGuildBan(guildID: string, userID: string): Promise<{
        reason?: string;
        user: User;
    }>;
    crossPostMessage(channelID: string, messageID: any): Promise<Message>;
    hasPermission(permission: Permissions, permissions: number): boolean;
    private request;
}
export {};
//# sourceMappingURL=Discord.d.ts.map