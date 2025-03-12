export interface BlacklistOptions {
	_id: string;
	id: string;
	reason: string;
	blacklistedBy?: string;
	blacklistedAt?: number;
	auto?: boolean;
	type?: 'user' | 'server';
}
