"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("com.foodexpressbot.types/types");
class Permissions {
    permissions;
    constructor(permissions) {
        this.permissions = permissions;
    }
    hasPermission(permission) {
        return (this.permissions & this.getPermissionValue(permission)) === this.getPermissionValue(permission);
    }
    addPermission(permission) {
        this.permissions |= this.getPermissionValue(permission);
    }
    getPermissionValue(name) {
        if (typeof name === 'string') {
            // @ts-ignore
            return types_1.Permissions[name];
        }
        else {
            return name;
        }
    }
}
exports.default = Permissions;
//# sourceMappingURL=Permissions.js.map