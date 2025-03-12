import { UserOptions } from './user';

export interface StoreItem {
	id: number;
	name: string;
	description: string;
	prices: StoreItemPrices
	specialOffer?: {
		startDate: number;
		endDate: number;
		prices: StoreItemPrices;
	} | null,
	perks?: string[];
	hasPerk?: (userOptions: UserOptions, storeData?: object) => boolean;
	purchaseAction?: (user: UserOptions, storeData?: object) => Promise<boolean>;
}

export interface StoreItemPrices {
	realMoney: number;
	virtualMoney: number;
}
