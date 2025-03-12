"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (message) => {
    return message
        .split('*').join('')
        .split('`').join('\'');
};
//# sourceMappingURL=escapeMarkdown.js.map