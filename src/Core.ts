import { Db } from 'mongodb';
import EventEmitter from 'events';
import Database from './Structure/Database';
import Redis from './Structure/Redis';
import RabbitMQ from './Structure/RabbitMQ';
import Logger from './Util/Logger';
import Encrypyter from './Structure/Encrypyter';
import Controller from './Controllers/Index';
import Cache from './Cache/Index';

export interface ClientOptions {
    mongo: {
        uri: string;
        db: string;
    }

    redis: {
        uri: string;
        db?: string;
    }

    rabbitmq: {
        uri: string;
        channel?: 'api' | 'bot' | 'gateway';
    }

    tokens?: {
        unsplash?: string;
    }

    cache?: {
        enabled: boolean;
        autoInit?: ('ranks')[];
    }

    discord?: {
        token: string;
        clientID?: string;
        clientSecret?: string;
        redirectURI?: string;
        scopes?: string[];

        guilds?: {
            main?: string;
            management?: string;
        }

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
            }

            modmail?: {
                category?: string;
                log?: string;
            }
        }

        roles?: {
            stickersAndEmojis?: string
        }
    }

    encrypterToken: string;

    userAgent?: string;
}

export class Core extends EventEmitter {
    public readonly clientOptions: ClientOptions;
    public db: Db;
    public redis: Redis;
    public rabbitmq: RabbitMQ;
    public controllers: Controller;
    public encrypyter: Encrypyter;
    public cache: Cache;

    constructor(options: ClientOptions) {
        super();
        this.clientOptions = options;
        this.db = null;
        this.redis = null;
        this.controllers = null;
        this.redis = new Redis();
        this.rabbitmq = new RabbitMQ(options.rabbitmq.channel);
        this.controllers = null;
        this.encrypyter = new Encrypyter(options.encrypterToken);
        this.cache = null;
        Logger.info('[CORE] Starting initialization...');
    }

    public start(): Promise<void> {
        try {
            return new Promise(async (resolve, reject) => {
                try {
                    // Init MongoDB, Redis & RabbitMQ
                    this.db = await new Database(this.clientOptions.mongo.uri, this.clientOptions.mongo.db).connect();
                    await this.rabbitmq.connect();

                    // Load the controllers and any other modules
                    this.controllers = new Controller(this, this.db);

                    // Check if the cache is enabled for the service
                    if (this.clientOptions.cache?.enabled) {
                        // Init the cache
                        this.cache = new Cache(this, this.db);
                    }

                    // Done! Start the parent project
                    Logger.info('[CORE] Initialization complete, starting project...');
                    this.emit('ready');
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        } catch (e) {

            Logger.error(e);
        }
    }
}
