export default class Permissions {
    permissions: number;
    constructor(permissions: number);
    hasPermission(permission: string | number): boolean;
    addPermission(permission: string | number): void;
    private getPermissionValue;
}
//# sourceMappingURL=Permissions.d.ts.map