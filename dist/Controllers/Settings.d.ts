import Controller from '../Structure/Controller';
import { SettingsValue } from 'com.foodexpressbot.types/types';
/**
 * Controller for the settings
 */
export default class Settings extends Controller {
    constructor(client: any, db: any);
    isSettingsExist(): Promise<Boolean>;
    initDefaultSettings(): Promise<void>;
    getSettingsFromDatabase(): Promise<SettingsValue[]>;
    updateCache(): Promise<void>;
    getSetting(key: string): Promise<any>;
    getSettingsFromCache(): Promise<SettingsValue>;
    modifySetting<T>(key: String, value: T): Promise<void>;
}
//# sourceMappingURL=Settings.d.ts.map