import { UserOptions } from 'com.foodexpressbot.types/types';

export default class User {
    constructor(user: UserOptions) {
        for (const prop in user) {
            if (user.hasOwnProperty(prop)) {
                this[prop] = user[prop];
            }
        }
    }
}
