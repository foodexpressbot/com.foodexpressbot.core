export type RatelimitOptions = {
    ip: string;
    userID?: string;
    route: string;
    totalRequests: number;
    timestamp: number;
    expiry: number;
}
