import Controller from '../Structure/Controller';
<<<<<<< HEAD
import { SubscriptionOptions, StripeCustomerData, UserSubscriptionOptions } from 'com.foodexpressbot.types/types';
=======
import { SubscriptionOptions, StripeCustomerData, UserSubscriptionOptions } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)
import Stripe from 'stripe';

export default class StripeController extends Controller {
	public declare allowedFields: string[];

	public stripe: Stripe;
	constructor(client, db) {
		super(client, db);
		this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: null });
	}

	public getSubscriptions(filter?: object): Promise<SubscriptionOptions[]> {
		return new Promise(async (resolve, reject) => {
			try {
				const subscriptions = await this.db.collection<SubscriptionOptions>('available_subscriptions').find(filter).sort({ position: 1 }).toArray();

				resolve(subscriptions);
			} catch (e) {
				reject(e);
			}
		});
	}

	public getSubscription(filter?: object): Promise<SubscriptionOptions | null> {
		return new Promise(async (resolve, reject) => {
			try {
				const subscription = await this.db.collection<SubscriptionOptions>('available_subscriptions').findOne(filter);

				resolve(subscription);
			} catch (e) {
				reject(e);
			}
		});
	}


	public createCheckout(options: Stripe.Checkout.SessionCreateParams): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const session = await this.stripe.checkout.sessions.create(options);
				resolve(session);
			} catch (e) {
				reject(e);
			}
		});
	}

	public getCustomer(filter: object): Promise<StripeCustomerData | null> {
		return new Promise(async (resolve, reject) => {
			try {
				const customer = await this.db.collection<StripeCustomerData>('stripe_customers').findOne(filter);
				resolve(customer);
			} catch (e) {
				reject(e);
			}
		});
	}

	public createCustomer(options: Stripe.CustomerCreateParams): Promise<Stripe.Customer> {
		return new Promise(async (resolve, reject) => {
			try {
				const customer = await this.stripe.customers.create(options);
				resolve(customer);
			} catch (e) {
				reject(e);
			}
		});
	}

	public getUserSubscriptions(filter?: object): Promise<UserSubscriptionOptions[]> {
		return new Promise(async (resolve, reject) => {
			try {
				const subscriptions = await this.db.collection<UserSubscriptionOptions>('stripe_user_subscriptions').find(filter).toArray();

				resolve(subscriptions);
			} catch (e) {
				reject(e);
			}
		});
	}

	public getUserSubscription(filter?: object): Promise<UserSubscriptionOptions | null> {
		return new Promise(async (resolve, reject) => {
			try {
				const subscriptions = await this.db.collection<UserSubscriptionOptions>('stripe_user_subscriptions').findOne(filter);

				resolve(subscriptions);
			} catch (e) {
				reject(e);
			}
		});
	}

	public generateCustomerPortal(options: Stripe.BillingPortal.SessionCreateParams): Promise<Stripe.BillingPortal.Session> {
		return new Promise(async (resolve, reject) => {
			try {
				const session = await this.stripe.billingPortal.sessions.create(options);
				resolve(session);
			} catch (e) {
				reject(e);
			}
		});
	}

	public isSubscriptionActive(status: Stripe.Subscription.Status): boolean {
		return status === 'active' || status === 'trialing';
	}

	public verifyWebhookSignature(body: string, signature: string): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				const event = this.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
				resolve(event as any);
			} catch (e) {
				//
				reject({ code: 'webhook_error', message: 'Webhook Error: ' + e.message });
			}
		});
	}

}
