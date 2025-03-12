"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("../Structure/Controller"));
const stripe_1 = __importDefault(require("stripe"));
class StripeController extends Controller_1.default {
    stripe;
    constructor(client, db) {
        super(client, db);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: null });
    }
    getSubscriptions(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const subscriptions = await this.db.collection('available_subscriptions').find(filter).sort({ position: 1 }).toArray();
                resolve(subscriptions);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getSubscription(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const subscription = await this.db.collection('available_subscriptions').findOne(filter);
                resolve(subscription);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createCheckout(options) {
        return new Promise(async (resolve, reject) => {
            try {
                const session = await this.stripe.checkout.sessions.create(options);
                resolve(session);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getCustomer(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const customer = await this.db.collection('stripe_customers').findOne(filter);
                resolve(customer);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    createCustomer(options) {
        return new Promise(async (resolve, reject) => {
            try {
                const customer = await this.stripe.customers.create(options);
                resolve(customer);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUserSubscriptions(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const subscriptions = await this.db.collection('stripe_user_subscriptions').find(filter).toArray();
                resolve(subscriptions);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getUserSubscription(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const subscriptions = await this.db.collection('stripe_user_subscriptions').findOne(filter);
                resolve(subscriptions);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    generateCustomerPortal(options) {
        return new Promise(async (resolve, reject) => {
            try {
                const session = await this.stripe.billingPortal.sessions.create(options);
                resolve(session);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    isSubscriptionActive(status) {
        return status === 'active' || status === 'trialing';
    }
    verifyWebhookSignature(body, signature) {
        return new Promise((resolve, reject) => {
            try {
                const event = this.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
                resolve(event);
            }
            catch (e) {
                //
                reject({ code: 'webhook_error', message: 'Webhook Error: ' + e.message });
            }
        });
    }
}
exports.default = StripeController;
//# sourceMappingURL=Stripe.js.map