export default (message: string): string => {
    return message
        .split('*').join('')
        .split('`').join('\'');
};
