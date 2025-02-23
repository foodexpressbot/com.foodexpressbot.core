
export default (userID: string, avatar: string, size?: string): string => {
    if (!avatar) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    return 'https://cdn.discordapp.com/avatars/' + userID + '/' + avatar + '.' + (avatar.startsWith('a_') ? 'gif' : 'png')+ '?size=' + (size || '128');
};
