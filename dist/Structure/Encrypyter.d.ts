export default class Encrypyter {
    private readonly hash;
    private readonly iv;
    constructor(key: any);
    encrypt(data: string): Promise<string>;
    decrypt(data: string): Promise<string>;
}
//# sourceMappingURL=Encrypyter.d.ts.map