import Controller from '../Structure/Controller';
import { TeamOptions } from 'com.foodexpressbot.types/types';
/**
 * Controller for the teams feature
 */
export default class Teams extends Controller {
    constructor(client: any, db: any);
    /**
     *
     * @param data The data for team to create
     * @returns Promise
     */
    createTeam(data: TeamOptions): Promise<TeamOptions>;
    incrementOrders(teamID: string, amount?: number): Promise<void>;
    setOrders(teamID: string, amount: number): Promise<void>;
    updateTeam(filter: string | object, data: object): Promise<object>;
    /**
     *
     * @param id The id of the team to delete
     * @returns Promise
     */
    deleteTeam(id: string): Promise<void>;
    /**
     *
     * @param id The id of the team to fetch
     * @returns The team fetched
     */
    getTeam(id: string): Promise<TeamOptions>;
    /**
     *
     * @param filter The aggregation pipeline
     * @param sort The sort object
     * @param limit The limit of the query
     * @returns An array of resulting teams
     */
    getTeams(filter?: object, sort?: object, limit?: number): Promise<TeamOptions[]>;
    /**
     * This method should be used when accepting new Kitchen Staff members, to randomly assign them to a team.
     * @returns Randomly selected team from the database
     */
    getRandomTeam(): Promise<string>;
    /**
     *
     * @param userID Id of the user to add the team to
     * @param teamID Id of the team to add to the user
     * @returns void
     */
    updateUserTeam(userID: string, teamID: string | null): Promise<void>;
}
//# sourceMappingURL=Teams.d.ts.map