import Controller from '../Structure/Controller';
import { ClaimedObjectiveOptions, ObjectiveOptions } from 'com.foodexpressbot.types/types';
export default class Objective extends Controller {
    constructor(client: any, db: any);
    getClaimedAchievements(userID: string): Promise<ClaimedObjectiveOptions[]>;
    createObjective(data: ObjectiveOptions): Promise<object>;
    deleteObjective(id: string): Promise<void>;
    completeObjectiveForUser(userID: string, objectiveID: string): Promise<void>;
    getObjectives(filter?: object): Promise<ObjectiveOptions[]>;
    getObjective(id: string): Promise<ObjectiveOptions>;
}
//# sourceMappingURL=Objective.d.ts.map