import { WarningOptions } from 'com.foodexpressbot.types/types';
import Controller from '../Structure/Controller';
export default class WarningsController extends Controller {
    constructor(client: any, db: any);
    getWarnings(filter: object, limit?: number, sort?: object): Promise<WarningOptions[]>;
    issueWarning(warning: WarningOptions): Promise<WarningOptions>;
    removeWarning(query: object): Promise<void>;
}
//# sourceMappingURL=Warnings.d.ts.map