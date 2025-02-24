<<<<<<< HEAD
import { UserOptions } from 'com.foodexpressbot.types/types';
=======
import { UserOptions } from 'com.virtualdinerbot.types/types';
>>>>>>> 70d76e4 (Initial commit)

export default class User {
    constructor(user: UserOptions) {
        for (const prop in user) {
            if (user.hasOwnProperty(prop)) {
                this[prop] = user[prop];
            }
        }
    }
}
