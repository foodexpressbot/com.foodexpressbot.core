import crypto from 'crypto';

export default class Encrypyter {
    private readonly hash: string;
    private readonly iv: Buffer;
    constructor(key) {
        // @ts-ignore
        this.hash = crypto.createHash('md5').update(key, 'utf-8').digest('hex').toUpperCase();
        this.iv = Buffer.alloc(16);
    }

    public encrypt(data: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                if (!data) return null;
                let cipher = crypto.createCipheriv('aes-256-cbc', this.hash, this.iv);
                resolve(cipher.update(data, 'utf8', 'hex') + cipher.final('hex'));
            } catch (e) {
                reject(e);
            }
        });
    }

    public decrypt(data: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                if (!data) return null;
                let cipher = crypto.createDecipheriv('aes-256-cbc', this.hash, this.iv);
                resolve(cipher.update(data, 'hex', 'utf8') + cipher.final('utf8'));
            } catch (e) {
                reject(e);
            }
        });
    }
}
