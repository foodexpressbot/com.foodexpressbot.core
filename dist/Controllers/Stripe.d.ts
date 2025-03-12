import Controller from '../Structure/Controller';
import { SubscriptionOptions, StripeCustomerData, UserSubscriptionOptions } from 'com.foodexpressbot.types/types';
import Stripe from 'stripe';
export default class StripeController extends Controller {
    allowedFields: string[];
    stripe: Stripe;
    constructor(client: any, db: any);
    getSubscriptions(filter?: object): Promise<SubscriptionOptions[]>;
    getSubscription(filter?: object): Promise<SubscriptionOptions | null>;
    createCheckout(options: Stripe.Checkout.SessionCreateParams): Promise<any>;
    getCustomer(filter: object): Promise<StripeCustomerData | null>;
    createCustomer(options: Stripe.CustomerCreateParams): Promise<Stripe.Customer>;
    getUserSubscriptions(filter?: object): Promise<UserSubscriptionOptions[]>;
    getUserSubscription(filter?: object): Promise<UserSubscriptionOptions | null>;
    generateCustomerPortal(options: Stripe.BillingPortal.SessionCreateParams): Promise<Stripe.BillingPortal.Session>;
    isSubscriptionActive(status: Stripe.Subscription.Status): boolean;
    verifyWebhookSignature(body: string, signature: string): Promise<any>;
}
//# sourceMappingURL=Stripe.d.ts.map