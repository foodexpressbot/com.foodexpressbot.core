import { Permissions as Perms } from 'com.foodexpressbot.types/types';

export default class Permissions {
	public permissions: number;
	constructor(permissions: number) {
		this.permissions = permissions;
	}

	public hasPermission(permission: string | number): boolean {
		return (this.permissions & this.getPermissionValue(permission)) === this.getPermissionValue(permission);
	}

	public addPermission(permission: string | number): void {
		this.permissions |= this.getPermissionValue(permission);
	}


	private getPermissionValue(name: string | number): number {
		if (typeof name === 'string') {
			// @ts-ignore
			return Perms[name];
		} else {
			return name;
		}
	}
}
