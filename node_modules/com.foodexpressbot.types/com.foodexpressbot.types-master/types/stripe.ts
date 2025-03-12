export interface StripeCustomerData {
    _id?: string;
    userID: string;
}

export interface SubscriptionOptions {
    _id: string;
    name: string;
    price: number;
    billingInterval?: 'once' | 'monthly' | 'yearly'
    benefits: string[];
    ranks?: string[];
    position?: number;
    stripeData?: {
        priceID?: string;
        productID?: string;
        type?: 'payment' | 'setup' | 'subscription'
    }
}

export interface UserSubscriptionOptions {
    _id: string;
    customerID: string;
    discordID?: string;
    planID: string;
    status: string;
    startDate: number;
    endedAt?: number | null;

    billingInfo?: {
        lastInvoiceDate?: number;
        nextInvoiceDueDate?: number;
        cancelledAt?: number;
        paymentInterval: string;
        amountPaid: number;
    }
}
