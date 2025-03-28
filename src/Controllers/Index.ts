import { Core } from '../Core';
import { Db } from 'mongodb';

import Discord from './Discord';
import User from './User';
import Order from './Order';
import Objective from './Objective';
import Session from './Session';
import Backlog from './Backlog';
import Rank from './Rank';
import Blacklist from './Blacklist';
import Appeal from './Appeal';
import FoodLookup from './FoodLookup';
import OnLeave from './OnLeave';
import Store from './Store';
import Recruitment from './Recruitment';
import DeliveryQueue from './DeliveryQueue';
import Warnings from './Warnings';
import Statistics from './Statistics';
import Teams from './Teams';
import Settings from './Settings';
import Stripe from './Stripe';
import Reports from './Reports';
import DeliveryMessages from './DeliveryMessages';
import ModMail from './ModMail';
import Requests from './Requests';
import Ratelimits from './Ratelimits';

export default class Controller {
    public client: Core;
    public db: Db;

    public discord: Discord;
    public user: User;
    public order: Order;
    public objective: Objective;
    public session: Session;
    public backlog: Backlog;
    public rank: Rank;
    public team: Teams;
    public blacklist: Blacklist;
    public appeal: Appeal;
    public foodlookup: FoodLookup;
    public onleave: OnLeave;
    public settings: Settings;
    public store: Store;
    public recruitment: Recruitment;
    public deliveryQueue: DeliveryQueue;
    public warnings: Warnings;
    public statistics: Statistics;
    public stripe: Stripe;
    public reports: Reports;
    public deliveryMessages: DeliveryMessages;
    public modMail: ModMail;
    public requests: Requests;
    public ratelimits: Ratelimits;
    constructor(client, db) {
        this.discord = new Discord(client, db);
        this.user = new User(client, db);
        this.order = new Order(client, db);
        this.objective = new Objective(client, db);
        this.session = new Session(client, db);
        this.backlog = new Backlog(client, db);
        this.rank = new Rank(client, db);
        this.team = new Teams(client, db);
        this.blacklist = new Blacklist(client, db);
        this.appeal = new Appeal(client, db);
        this.foodlookup = new FoodLookup(client, db);
        this.onleave = new OnLeave(client, db);
        this.settings = new Settings(client, db);
        this.store = new Store(client, db);
        this.recruitment = new Recruitment(client, db);
        this.deliveryQueue = new DeliveryQueue(client, db);
        this.warnings = new Warnings(client, db);
        this.statistics = new Statistics(client, db);
        this.stripe = new Stripe(client, db);
        this.reports = new Reports(client, db);
        this.deliveryMessages = new DeliveryMessages(client, db);
        this.modMail = new ModMail(client, db);
        this.requests = new Requests(client, db);
        this.ratelimits = new Ratelimits(client, db);
    }
}
