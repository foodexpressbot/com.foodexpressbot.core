import Controller from '../Structure/Controller';
import { SessionOptions } from 'com.foodexpressbot.types/types';
export default class SessionController extends Controller {
    constructor(client: any, db: any);
    createSession(data: SessionOptions): Promise<string>;
    getSession(filter: string | object): Promise<SessionOptions>;
    getSessions(filter: string | object): Promise<SessionOptions[]>;
    deleteSession(sessionID: string): Promise<boolean>;
    deleteSessions(query: object): Promise<boolean>;
    generateToken(): Promise<string>;
    decryptToken(token: any): Promise<string | null>;
}
//# sourceMappingURL=Session.d.ts.map