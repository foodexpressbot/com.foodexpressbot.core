export interface BacklogOptions {
	orderID?: string;
	chef?: string;
	deliveredBy?: string;
	orderedBy?: string;
	userOrder?: string;
	reason?: string;
	reportReason?: string;
	images?: string[];
	chefNote?: string | null;
	type?: BacklogTypes;
	orderFeedback?: OrderFeedback;
	addedAt?: number;
}

export enum BacklogTypes {
	Delete = 0,
	Delivered = 1,
	Cancel = 2,
	Reported = 3
}

export interface OrderFeedback {
	feedbackMessage?: string;
	tip?: {
		chef?: number;
		delivery?: number;
	};
	sentAt?: number;
}
