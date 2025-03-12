import { ModMailTicketOptions } from 'com.foodexpressbot.types/types';
import Controller from '../Structure/Controller';
import { Message } from 'discord.js';
export default class ModMailController extends Controller {
    constructor(client: any, db: any);
    getTicket(filter: object): Promise<ModMailTicketOptions | null>;
    initTicket(userID: string, query: string): Promise<void>;
    createTicket(options: Partial<ModMailTicketOptions>, user?: any): Promise<void>;
    updateTicket(ticket: ModMailTicketOptions, message: Message): Promise<void>;
    handleDMMessage(ticket: ModMailTicketOptions, message: Message): Promise<void>;
    isBlocked(userID: string): Promise<boolean>;
}
//# sourceMappingURL=ModMail.d.ts.map