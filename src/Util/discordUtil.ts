export const SERVER_ID_REGEX = /^(?:[0-9]{15,21})$/;

export default class DiscordUtil {
    public static getDiscordUsername(user: any): string {
        if (user.discriminator === '0') {
            return user.username;
        }

        return user.username + '#' + user.discriminator;
    }

    public static isServerID(serverID: string): boolean {
        return SERVER_ID_REGEX.test(serverID);
    }
}
