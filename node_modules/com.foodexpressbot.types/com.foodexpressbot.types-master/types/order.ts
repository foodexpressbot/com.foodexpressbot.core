import { UserOptions } from './user';

export interface OrderOptions {
	_id?: string;
	orderID?: string;
	user?: {
		id?: string;
		username?: string;
		discriminator?: string;
		avatar?: string;
	};
	orderUserMentions?: OrderMentionsOptions[];
	guild?: {
		id?: string;
		name?: string;
		icon?: string | null;
	};
	order?: string;
	orderChannel?: string;
	status?: OrderStatus;
	prepareExpiry?: number;
	images?: string[];
	chefNote?: string | null;
	claimedBy?: {
		user?: string;
		expiry?: number
	}
	deliveryAssignedTo?: {
		userID?: string;
		expiry?: number
	}
	priority?: boolean;
	prepareDuration?: number;
	sentAt?: number;
}

export enum OrderStatus {
	Unclaimed = 0,
	Claimed = 1,
	Preparing = 2,
	PendingDelivery = 3
}

export interface OrderMentionsOptions {
	id?: string;
	displayName?: string;
	username?: string;
	avatar?: string;
}

export interface OrderReportOptions {
	_id: string;
	reason?: string;
}

export interface ShareDeliveryMessageOptions {
	_id: string;
	title: string;
	message: string;
	slug: string;
	createdBy: string;
	createdAt: number;
	lastUpdatedAt: number;

	// Aggregated
	createdByUser?: UserOptions
}

export type SearchedImage = {
	description: string;
	url: string;
}
