"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\W/g, ' ')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/#/, 'sharp');
};
//# sourceMappingURL=slugify.js.map