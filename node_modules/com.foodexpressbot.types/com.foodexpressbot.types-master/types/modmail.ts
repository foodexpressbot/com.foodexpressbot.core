export interface ModMailTicketOptions {
	_id: string;
	userID: string;
	status: ModMailTicketStatus;
	question: string;
	channelID: string;
	logs: ModMailTicketLogOption[]
}

export interface ModMailTicketLogOption {
	content: string;
	user: {
		id: string;
		username: string;
	};
	attachments: string[];
	sentAt: number;
}

export interface ModMailBlockedUsers {
	_id: string;
}

export enum ModMailTicketStatus {
	OPEN = 1,
	CLOSED = 2,
	// SUSPENDED = 3
}

export enum ModMailTicketEmbedColours {
	SUCCESS = 1686856,
	TICKET = 4886754,
	CLOSED = 16711712
}
