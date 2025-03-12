import Controller from '../Structure/Controller';
import { UserOptions, RecruitmentApplicationStatus, RecruitmentApplicationResponse, RecruitmentApplicationOption, RecruitmentFormOptions } from 'com.foodexpressbot.types/types';
export default class RecruitmentController extends Controller {
    constructor(client: any, db: any);
    getRecruitmentForms(filter?: object): Promise<RecruitmentFormOptions[]>;
    getRecruitmentForm(filter: string | object): Promise<RecruitmentFormOptions>;
    createRecruitmentForm(data: RecruitmentFormOptions): Promise<string>;
    updateRecruitmentForm(query: string | object, data: object): Promise<void>;
    deleteRecruitmentForm(formID: string): Promise<void>;
    sendRecruitmentApplication(filter: string | object, user: UserOptions, parsedData: any): Promise<unknown>;
    getRecruitmentApplications(filter: object, appsQuery: object[], additionalFields?: string[]): Promise<RecruitmentApplicationResponse[]>;
    getUserApplication(filter: string | object, fields?: string[]): Promise<RecruitmentApplicationOption | null>;
    getUserApplications(filter: object, sort?: object, limit?: number, fields?: string[]): Promise<RecruitmentApplicationOption[]>;
    updateApplicationStatus(filter: string | object, staffMember: UserOptions, status: RecruitmentApplicationStatus, reason: string, staffNotes?: string): Promise<void>;
    validateRanks(data: RecruitmentFormOptions): Promise<boolean>;
    private handleDiscordMessage;
    canViewRecruitmentApplication(application: RecruitmentApplicationOption, user: UserOptions, allowUser?: boolean): boolean;
    formatDiscordLogMessage(message: string, user: UserOptions, staff?: UserOptions, reason?: string): string;
}
//# sourceMappingURL=Recruitment.d.ts.map