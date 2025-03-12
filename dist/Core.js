"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;
const events_1 = __importDefault(require("events"));
const Database_1 = __importDefault(require("./Structure/Database"));
const Redis_1 = __importDefault(require("./Structure/Redis"));
const RabbitMQ_1 = __importDefault(require("./Structure/RabbitMQ"));
const Logger_1 = __importDefault(require("./Util/Logger"));
const Encrypyter_1 = __importDefault(require("./Structure/Encrypyter"));
const Index_1 = __importDefault(require("./Controllers/Index"));
const Index_2 = __importDefault(require("./Cache/Index"));
class Core extends events_1.default {
    clientOptions;
    db;
    redis;
    rabbitmq;
    controllers;
    encrypyter;
    cache;
    constructor(options) {
        super();
        this.clientOptions = options;
        this.db = null;
        this.redis = null;
        this.controllers = null;
        this.redis = new Redis_1.default();
        this.rabbitmq = new RabbitMQ_1.default(options.rabbitmq.channel);
        this.controllers = null;
        this.encrypyter = new Encrypyter_1.default(options.encrypterToken);
        this.cache = null;
        Logger_1.default.info('[CORE] Starting initialization...');
    }
    start() {
        try {
            return new Promise(async (resolve, reject) => {
                try {
                    // Init MongoDB, Redis & RabbitMQ
                    this.db = await new Database_1.default(this.clientOptions.mongo.uri, this.clientOptions.mongo.db).connect();
                    await this.rabbitmq.connect();
                    // Load the controllers and any other modules
                    this.controllers = new Index_1.default(this, this.db);
                    // Check if the cache is enabled for the service
                    if (this.clientOptions.cache?.enabled) {
                        // Init the cache
                        this.cache = new Index_2.default(this, this.db);
                    }
                    // Done! Start the parent project
                    Logger_1.default.info('[CORE] Initialization complete, starting project...');
                    this.emit('ready');
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        catch (e) {
            Logger_1.default.error(e);
        }
    }
}
exports.Core = Core;
//# sourceMappingURL=Core.js.map