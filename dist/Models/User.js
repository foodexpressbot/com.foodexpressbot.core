"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(user) {
        for (const prop in user) {
            if (user.hasOwnProperty(prop)) {
                this[prop] = user[prop];
            }
        }
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map