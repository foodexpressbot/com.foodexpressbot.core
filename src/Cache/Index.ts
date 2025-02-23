import { Core } from '../Core';
import { Db } from 'mongodb';

import Ranks from './Ranks';

export default class Caches {
    public client: Core;
    public ranks: Ranks;

    constructor(client: Core, db: Db) {
        this.ranks = new Ranks(client, db);
    }
}
