import { Db } from 'mongodb';
import EventEmitter from 'events';
import Redis from './Structure/Redis';
import RabbitMQ from './Structure/RabbitMQ';
import Encrypyter from './Structure/Encrypyter';
import Controller from './Controllers/Index';
import Cache from './Cache/Index';
export interface ClientOptions {
    mongo: {
        uri: string;
        db: string;
    };
    redis: {
        uri: string;
        db?: string;
    };
    rabbitmq: {
        uri: string;
        channel?: 'api' | 'bot' | 'gateway';
    };
    tokens?: {
        unsplash?: string;
    };
    cache?: {
        enabled: boolean;
        autoInit?: ('ranks')[];
    };
    discord?: {
        token: string;
        clientID?: string;
        clientSecret?: string;
        redirectURI?: string;
        scopes?: string[];
        guilds?: {
            main?: string;
            management?: string;
        };
        inviteCode?: string;
        channels?: {
            orderLog?: string;
            staffChanges?: string;
            announcements?: string;
            managementCommands?: string;
            applicationLog?: string;
            appealLog?: string;
            staffInfo?: string;
            staffRules?: string;
            staffCommands?: string;
            staffChat?: string;
            staffRemovalLog?: string;
            websiteBanLog?: string;
            foodLookupLog?: string;
            storeLog?: string;
            onLeaveLog?: string;
            managementStats?: string;
            managementOrderLog?: string;
            objectiveClaimLog?: string;
            teamLog?: string;
            teamAnnouncements?: string;
            dailySpecial?: string;
            userRequests?: {
                log?: string;
                reports?: string;
            };
            modmail?: {
                category?: string;
                log?: string;
            };
        };
        roles?: {
            stickersAndEmojis?: string;
        };
    };
    encrypterToken: string;
    userAgent?: string;
}
export declare class Core extends EventEmitter {
    readonly clientOptions: ClientOptions;
    db: Db;
    redis: Redis;
    rabbitmq: RabbitMQ;
    controllers: Controller;
    encrypyter: Encrypyter;
    cache: Cache;
    constructor(options: ClientOptions);
    start(): Promise<void>;
}
//# sourceMappingURL=Core.d.ts.map