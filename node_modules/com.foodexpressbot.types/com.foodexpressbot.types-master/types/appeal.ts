import { UserOptions } from './user';

export interface AppealOptions {
	_id?: string;
	id?: string;
	// Injected by the controller
	user?: UserOptions;
	userID?: string;
	serverID?: string;
	userAppeal?: string;
	status?: AppealStatus;
	type?: AppealType;
	punishmentInfo?: PunishmentOptions;
	sentAt?: number;
	votes?: UpvoteOptions[]
}

export interface PunishmentOptions {
	punishmentID?: string;
	issuedBy?: string;
	reason?: string;
	issuedAt?: number;
}

export interface UpvoteOptions {
	userID?: string;
	note?: string;
	upvoted?: boolean;
}

export enum AppealType {
	DiscordBan = 1,
	UserBlacklist = 2,
	ServerBlacklist = 3
}

export enum AppealStatus {
	PENDING = 0,
	ON_HOLD = 1,
	ACCEPTED = 2,
	DENIED = 3
}
