import { RankOptions } from './rank';
import { UserOptions } from './user';

export interface RecruitmentFormOptions {
	_id?: string;
	id?: string;
	name?: string;
	descriptions?: {
		short?: string;
		detailed?: string;
	};
	requirements?: string;
	ranks?: string[] | RankOptions[];
	manageableRanks?: string[] | RankOptions[];
	questions?: RecruitmentQuestionOptions[];
	options?: {
		minimumAge?: number;
		discordAccountAge?: number;
		requiresDiscordServer?: boolean;
		allowMultipleApplications?: boolean;
		applicationSubmissionFrequency?: string | null;
	};
	discordLog?: {
		channelID?: string;
		applicationReceivedMessage?: RecruitmentDiscordLogOption;
		applicationAcceptedMessage?: RecruitmentDiscordLogOption;
		applicationDeniedMessage?: RecruitmentDiscordLogOption;
	};
	discordMessages?: RecruitmentDiscordChannelMessage[];
	opensAt?: number | null;
	closesAt?: number | null;
	createdAt?: number;
}

export interface RecruitmentQuestionOptions {
	label?: string;
	name?: string;
	key?: string;
	type?: 'input' | 'textarea'; // Add options for radio, select etc. For now, we'll just use the basics.
	placeholderText?: string;
	required?: boolean;
	message?: string;
}

export interface RecruitmentApplicationOption {
	_id?: string;
	id?: string;
	userID?: string;
	formID?: string;
	// * *Aggregate data **
	user?: UserOptions;
	form?: RecruitmentFormOptions;
	responses?: RecruitmentApplicationResponse[];
	status?: RecruitmentApplicationStatus;
	reason?: string;
	staffNotes?: string;
	staffMember?: string;
	sentAt?: number;
}

export enum RecruitmentApplicationStatus {
	PENDING = 0,
	HOLD = 1,
	ACCEPTED = 2,
	DENIED = 3
}

export interface RecruitmentApplicationResponse {
	key?: string;
	value?: string;
}

export interface RecruitmentDiscordLogOption {
	channelMessage?: string;
	userMessage?: string;
}

export interface RecruitmentDiscordChannelMessage {
	name?: string;
	channelID?: string | 'user';
	status?: RecruitmentApplicationStatus;
	message?: string;
}
