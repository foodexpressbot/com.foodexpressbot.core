"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (str) => {
    // Replace all fancy characters unless character is in array of allowed characters
    const allowedChars = ['♡', '♥', '❥', '❦', '❧', '❢', '☆', '★', '✧', '✦', '✷', '✻', '◔', '•', '❂', '⊙', '◉', '○', '⊕', '⸝', '⌗', '┈', '╰', '╭', '╯', '╮', '✘', 'ʔ', 'ʕ', '୨', '୧', 'っ', '꒷', '꒦', '︶', 'ღ', 'ᴥ', '‿', '◡', '･', 'ﾟ:', '‧', '₊', '・', '｡', '˚', '☾', '☽', '➤', '➪', '→', '←', '↣', '↢', '➸', '�', '�', 'ツ', '☺', '☻'];
    const allowedCharsRegEx = new RegExp(`[^${allowedChars.join('')}]`, 'g');
    return str.replace(allowedCharsRegEx, '');
};
//# sourceMappingURL=formatDeliveryMessage.js.map