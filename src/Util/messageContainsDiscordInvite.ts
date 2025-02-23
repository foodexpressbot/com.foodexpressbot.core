const REGEX = /(http(s)?:\/\/(www.)?)?(discord.gg|discord.io|discord.me|discord.link|invite.gg)\/\w+/;

export default (message: string): boolean => {
    return REGEX.test(message);
};
