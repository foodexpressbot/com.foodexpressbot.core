import Controller from '../Structure/Controller';
import { UserOptions, OrderReportOptions, OrderOptions } from 'com.foodexpressbot.types/types';
export default class Order extends Controller {
    allowedFields: string[];
    constructor(client: any, db: any);
    sendOrder(data: OrderOptions): Promise<OrderOptions>;
    cancelOrder(orderID: string, user: UserOptions): Promise<OrderOptions>;
    getOrders(filter?: object, fields?: string[]): Promise<OrderOptions[]>;
    getOrder(filter: string | object, fields?: string[]): Promise<OrderOptions>;
    searchImages(query: string): Promise<{
        description: string;
        url: string;
    }[]>;
    claimOrder(orderID: string, user: UserOptions | 'bot'): Promise<OrderOptions>;
    unclaimOrder(orderID: string, user: UserOptions): Promise<OrderOptions>;
    deleteOrder(orderID: string, user: UserOptions | null, reason: string): Promise<OrderOptions>;
    prepareOrder(orderID: string, user: UserOptions, imageURLs: string[] | null, chefNote: string | null): Promise<OrderOptions>;
    deliverOrder(orderID: string, user: UserOptions | null, report?: boolean, reportInfo?: {
        reason: string;
    }): Promise<OrderOptions>;
    updateOrder(filter: string | object, data: object): Promise<OrderOptions>;
    removeOrder(filter: string | object): Promise<void>;
    reportOrder(orderID: string, reason: string): Promise<void>;
    getOrderReports(): Promise<string[]>;
    getOrderReport(orderID: string): Promise<OrderReportOptions | null>;
    deleteOrderReport(orderID: string): Promise<void>;
    deleteOrderReports(query: object): Promise<void>;
    private getDeliveryMessage;
    private validateImages;
    private addOrdersToUser;
    generateOrderID(length?: number): string;
}
//# sourceMappingURL=Order.d.ts.map