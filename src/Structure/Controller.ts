import { Db, Collection } from 'mongodb';
import { Core } from '../Core';

export default class Controller {
    public client: Core;
    public db: Db;
    public collection?: Collection;
    public allowedFields?: string[];
    constructor(client, db) {
        this.client = client;
        this.db = db;
    }
}
