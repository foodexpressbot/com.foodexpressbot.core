import { Db, Collection } from 'mongodb';
import { Core } from '../Core';
export default class Controller {
    client: Core;
    db: Db;
    collection?: Collection;
    allowedFields?: string[];
    constructor(client: any, db: any);
}
//# sourceMappingURL=Controller.d.ts.map