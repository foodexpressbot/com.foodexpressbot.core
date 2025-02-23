import Controller from '../Structure/Controller';
import Snowflake from '../Structure/Snowflake';
import formatAggregate from '../Util/formatAggregate';
import dayjs from 'dayjs';
import dateUtil from '../Util/dateUtil';
import { UserOptions, RankOptions, Permissions, RecruitmentApplicationStatus, RecruitmentDiscordChannelMessage, RecruitmentApplicationResponse, RecruitmentApplicationOption, RecruitmentFormOptions } from 'com.foodexpressbot.types/types';
import Perms from '../Util/Permissions';
import { getCreationDate } from '../Util/snowflakes';
import getAgeFromDate from '../Util/getAgeFromDate';

export default class RecruitmentController extends Controller {
    constructor(client, db) {
        super(client, db);
        this.collection = this.db.collection('recruitment_forms');
        this.allowedFields = ['name', 'descriptions', 'requirements', 'ranks', 'manageableRanks', 'questions', 'discordLog', 'discordMessages', 'options', 'opensAt', 'closesAt', 'createdAt'];
    }

    public getRecruitmentForms(filter: object = {}): Promise<RecruitmentFormOptions[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const forms = await this.db.collection<RecruitmentFormOptions>('recruitment_forms').aggregate([
                    { $match: { ...filter } },
                    { $lookup: { from: 'ranks', localField: 'ranks', foreignField: 'id', as: 'ranks'} },
                    {
                        $lookup: {
                            from: 'ranks',
                            localField: 'manageableRanks',
                            foreignField: 'id',
                            as: 'manageableRanks'
                        }
                    },
                    { $project: formatAggregate(this.allowedFields, true) }
                ]).toArray();
                resolve(forms as RecruitmentFormOptions[]);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getRecruitmentForm(filter: string | object): Promise<RecruitmentFormOptions> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter == 'string') filter = {_id: filter};
                const forms = await this.getRecruitmentForms(filter);
                resolve(forms[0] as RecruitmentFormOptions);
            } catch (e) {
                reject(e);
            }
        });
    }

    public createRecruitmentForm(data: RecruitmentFormOptions): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const id = Snowflake.generate();
                await this.db.collection<RecruitmentFormOptions>('recruitment_forms').insertOne({
                    _id: id,
                    ...data,
                    createdAt: Date.now()
                });
                resolve(id);
            } catch (e) {

                reject(e);
            }
        });
    }

    public updateRecruitmentForm(query: string | object, data: object): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof query === 'string') query = {_id: query};
                await this.db.collection<RecruitmentFormOptions>('recruitment_forms').updateOne(query, data);
                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public deleteRecruitmentForm(formID: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.db.collection<RecruitmentFormOptions>('recruitment_forms').deleteOne({ _id: formID });
                await this.db.collection('recruitment_responses').deleteMany({formID});
                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public sendRecruitmentApplication(filter: string | object, user: UserOptions, parsedData: any) {
        return new Promise(async (resolve, reject) => {
            try {
                const form = await this.getRecruitmentForm(filter);
                if (!form) return reject({statusCode: 404, code: 'form_not_found', message: 'Form not found'});

                if (form.options?.requiresDiscordServer) {
                    if (!user.settings.inGuild) return reject({
                        statusCode: 400,
                        code: 'user_not_in_guild',
                        message: 'You must join our Discord server to send an application'
                    });
                }

                if (form.options?.discordAccountAge) {
                    const createdAt = getCreationDate(user.id);
                    const minimumAge = dateUtil().add(form.options.discordAccountAge, 'days').valueOf();
                    if (createdAt > minimumAge) return reject({
                        statusCode: 400,
                        code: 'too_young',
                        message: 'Your Discord account must be at least ' + form.options.discordAccountAge + ' days old to apply to this recruitment application'
                    });
                }

                if (form.options?.minimumAge) {
                    if (!user.birthday) return reject({
                        statusCode: 400,
                        code: 'missing_birthday',
                        message: 'You must set your birthday to send an application'
                    });
                    const age = getAgeFromDate(user.birthday);
                    if (form.options.minimumAge > age) return reject({
                        statusCode: 400,
                        code: 'too_young',
                        message: 'You must be at least ' + form.options.minimumAge + ' years old to apply to this recruitment application'
                    });
                }

                if ((form.ranks as RankOptions[]).find((r: RankOptions) => user.ranks.some((rank) => rank === r._id))) return reject({
                    statusCode: 400,
                    code: 'already_in_rank',
                    message: 'You cannot apply for a rank you already have'
                });

                const blacklist = await this.client.controllers.blacklist.getBlacklist(user.id);
                if (blacklist) return reject({
                    statusCode: 400,
                    code: 'blacklisted',
                    message: 'You cannot apply to this recruitment application because you are blacklisted'
                });

                // // TODO: Migrate this over to new system
                // This shouldn't be required anymore?
                if (user.staffApplications?.nextApplicationAllowed && Date.now() < user.staffApplications?.nextApplicationAllowed) return reject({
                    statusCode: 400,
                    code: 'application_cooldown',
                    message: 'You must wait to submit another application until ' + (dateUtil.duration(user.staffApplications.nextApplicationAllowed - Date.now()).humanize()) + ' has passed since submitting your previous application.'
                });

                if (form.options?.applicationSubmissionFrequency) {
                    let filterDuration = null;
                    switch (form.options.applicationSubmissionFrequency) {
                        case 'bi-daily':
                            filterDuration = dayjs().subtract(12, 'hours').valueOf();
                            break;
                        case 'daily':
                            filterDuration = dayjs().subtract(1, 'day').valueOf();
                            break;
                        case 'weekly':
                            filterDuration = dayjs().subtract(1, 'week').valueOf();
                            break;
                        case 'monthly':
                            filterDuration = dayjs().subtract(1, 'month').valueOf();
                            break;
                        case 'quarterly':
                            filterDuration = dayjs().subtract(3, 'months').valueOf();
                            break;
                        case 'yearly':
                            filterDuration = dayjs().subtract(1, 'year').valueOf();
                            break;
                    }

                    const applications = await this.db.collection('recruitment_responses').aggregate([
                        { $match: { userID: user.id, formID: form.id, sentAt: { $gte: filterDuration } } },
                        { $sort: { sentAt: -1 }},
                        { $limit: 1 },
                        { $project: formatAggregate(['sentAt'])}
                    ]).toArray();

                    if (applications.length >= 1) {
                        return reject({
                            statusCode: 400,
                            code: 'application_frequency_exceeded',
                            message: 'You must wait to submit another application until ' + (dateUtil.duration(applications[0].sentAt - filterDuration).humanize()) + ' has passed since submitting your previous application.'
                        });
                    }
                }

                if (!form.options?.allowMultipleApplications) {
                    const applications = await this.db.collection('recruitment_responses').countDocuments({
                        userID: user.id,
                        formID: form.id
                    });

                    if (applications >= 1) {
                        return reject({
                            statusCode: 400,
                            code: 'multiple_applications_not_allowed',
                            message: 'You have already sent an application, multiple applications are not permitted'
                        });
                    }
                }

                let data = [];
                let errors = [];

                for (const [key, value] of Object.entries(parsedData)) {
                    const question = form.questions.find((f) => f.key === key);
                    if (!question) continue;
                    if (question.required && !value) {
                        errors.push({key, message: 'Field is required'});
                    }
                    data.push({key, value});
                }

                if (errors.length) return reject({statusCode: 400, code: 'form_data_error', data: {errors}});
                if (!data.length) return reject({
                    statusCode: 400,
                    code: 'no_form_data_provided',
                    message: 'No form data was provided'
                });
                const id = Snowflake.generate();

                await this.db.collection<RecruitmentApplicationOption>('recruitment_responses').insertOne({
                    _id: id,
                    formID: form.id,
                    userID: user.id,
                    responses: data,
                    reason: null,
                    status: RecruitmentApplicationStatus.PENDING,
                    sentAt: Date.now()
                });

                if (form.discordLog?.channelID && (form.discordLog.applicationReceivedMessage?.channelMessage || form.discordLog.applicationReceivedMessage?.userMessage)) {
                    if (form.discordLog.applicationReceivedMessage.channelMessage) {
                        try {
                            await this.client.controllers.discord.createMessage(form.discordLog.channelID, this.formatDiscordLogMessage(form.discordLog.applicationReceivedMessage.channelMessage, user));
                        } catch {
                            // Fail silently
                        }
                    }

                    if (form.discordLog.applicationReceivedMessage.userMessage) {
                        try {
                            await this.client.controllers.discord.sendUserDM(user.id, this.formatDiscordLogMessage(form.discordLog.applicationReceivedMessage.userMessage, user));
                        } catch {
                            // Fail silently
                        }
                    }
                }

                const discordMessages = form.discordMessages?.filter((message: RecruitmentDiscordChannelMessage) => message.status === RecruitmentApplicationStatus.PENDING) ?? [];

                for (const message of discordMessages) {
                    try {
                        await this.handleDiscordMessage(message, user);
                    } catch {
                        // Error silently
                    }
                }

                resolve(id);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getRecruitmentApplications(filter: object, appsQuery: object[], additionalFields: string[] = []): Promise<RecruitmentApplicationResponse[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const applications = await this.db.collection<RecruitmentFormOptions>('recruitment_forms').aggregate<RecruitmentApplicationResponse>([
                    // { $lookup: { from: 'recruitment_responses', localField: '_id', foreignField: 'formID', as: 'responses' } },
                    {
                        $lookup: {
                            from: 'recruitment_responses',
                            let: {
                                formID: '$_id'
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$formID', '$$formID'] },
                                                ...appsQuery
                                            ]
                                        }
                                    }
                                },
                                {
                                    $sort: {
                                        sentAt: 1
                                    }
                                }
                            ],
                            as: 'responses'
                        }
                    },
                    {$match: {...filter}},
                    {$unwind: {path: '$responses', preserveNullAndEmptyArrays: true}},
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'responses.userID',
                            foreignField: '_id',
                            as: 'responses.user'
                        }
                    },
                    {$unwind: {path: '$responses.user', preserveNullAndEmptyArrays: true}},
                    {
                        $group: {
                            _id: '$_id',
                            form: {$push: '$$ROOT'},
                            responses: {$push: '$responses'}
                        }
                    },
                    {$unwind: '$form'},
                    {$limit: 1},
                    {$project: formatAggregate([...this.allowedFields.map((field: string) => 'form.' + field), 'form._id', 'responses._id', 'responses.status', 'responses.responses', 'responses.reason', 'responses.sentAt', 'responses.user._id', ...this.client.controllers.user.allowedFields.map((field: string) => 'responses.user.' + field), ...additionalFields], true)}
                ]).toArray();

                resolve(applications[0] as unknown as RecruitmentApplicationResponse[]);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getUserApplication(filter: string | object, fields: string[] = []): Promise<RecruitmentApplicationOption | null> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = {_id: filter};
                const applications = await this.getUserApplications(filter, null, 1, fields);
                resolve(applications[0] || null);
            } catch (e) {

                reject(e);
            }
        });
    }

    public getUserApplications(filter: object, sort?: object, limit?: number, fields: string[] = []): Promise<RecruitmentApplicationOption[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const applications = await this.db.collection('recruitment_responses').aggregate([
                    { $match: {...filter } },
                    { $sort: sort ? { ...sort } : { sentAt: -1 } },
                    { $limit: limit ? limit : 10 },
                    { $lookup: { from: 'users', localField: 'userID', foreignField: '_id', as: 'user' } },
                    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                    { $lookup: { from: 'recruitment_forms', localField: 'formID', foreignField: '_id', as: 'form' } },
                    { $unwind: { path: '$form', preserveNullAndEmptyArrays: false } },
                    { $project: formatAggregate(['user._id', 'user.username', 'user.avatar', 'user.ban', 'user.discriminator', 'user.information', 'user.ranks', 'userID', 'form', 'responses', 'reason', 'status', 'sentAt', ...fields], true, { 'user.id': '$user._id' }) }
                ]).toArray();
                resolve(applications);
            } catch (e) {

                reject(e);
            }
        });
    }

    public updateApplicationStatus(filter: string | object, staffMember: UserOptions, status: RecruitmentApplicationStatus, reason: string, staffNotes?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof filter === 'string') filter = {_id: filter};

                const application = await this.getUserApplication(filter);

                if (!application) return reject({
                    statusCode: 404,
                    code: 'application_not_found',
                    message: 'Application not found'
                });

                if (application.status === status && application.reason !== null && application.reason === reason) return reject({
                    statusCode: 400,
                    code: 'application_already_updated',
                    message: 'Application is already that status'
                });

                await this.db.collection<RecruitmentApplicationOption>('recruitment_responses').updateOne({ _id: application.id }, {
                    $set: {
                        status,
                        staffMember: staffMember.id,
                        reason,
                        staffNotes
                    }
                });

                if (application.status !== status) {
                    switch (status as RecruitmentApplicationStatus) {
                        case RecruitmentApplicationStatus.ACCEPTED:
                            if (application.form.ranks?.length > 0) {
                                // const ranks = await this.client.controllers.rank.getRanks({}, ['position']);
                                // let rankPositons: { id: string, position: number | null }[] = [];
                                // for (const rank of application.form.ranks as string[]) {
                                //     rankPositons.push({
                                //         id: rank,
                                //         position: ranks.find((r: RankOptions) => r.id === rank)?.position || null
                                //     });
                                // }
                                // const rank = rankPositons.filter((r) => r.position != null).sort((a, b) => a.position - b.position)[0];
                                // if (rank) {
                                //     await this.client.controllers.user.updateRanks(application.userID, [...application.user.ranks, ...application.form.ranks as string[]]);
                                // }
                                await this.client.controllers.user.updateRanks(application.userID, [...(application.user?.ranks || []), ...(application.form?.ranks || []) as string[]]);
                                // TODO: Move to new system
                                await this.client.controllers.user.updateUser(application.userID, { $set: { 'staffApplications.hiredAt': Date.now() }});
                            }
                            if (application.form.discordLog.channelID && (application.form.discordLog.applicationAcceptedMessage?.channelMessage || application.form.discordLog.applicationAcceptedMessage?.userMessage)) {
                                if (application.form.discordLog.applicationReceivedMessage.channelMessage) {
                                    try {
                                        await this.client.controllers.discord.createMessage(application.form.discordLog.channelID, this.formatDiscordLogMessage(application.form.discordLog.applicationAcceptedMessage.channelMessage, application.user, staffMember, reason));
                                    } catch {
                                        // Fail silently
                                    }
                                }

                                if (application.form.discordLog.applicationAcceptedMessage.userMessage) {
                                    try {
                                        await this.client.controllers.discord.sendUserDM(application.userID, this.formatDiscordLogMessage(application.form.discordLog.applicationAcceptedMessage.userMessage, application.user, staffMember, reason));
                                    } catch {
                                        // Fail silently
                                    }
                                }
                            }

                            break;
                        case RecruitmentApplicationStatus.DENIED:
                            if (application.form.discordLog.channelID && (application.form.discordLog.applicationDeniedMessage?.channelMessage || application.form.discordLog.applicationDeniedMessage?.userMessage)) {
                                if (application.form.discordLog.applicationReceivedMessage.channelMessage) {
                                    try {
                                        await this.client.controllers.discord.createMessage(application.form.discordLog.channelID, this.formatDiscordLogMessage(application.form.discordLog.applicationDeniedMessage.channelMessage, application.user, staffMember, reason));
                                    } catch {
                                        // Fail silently
                                    }
                                }

                                if (application.form.discordLog.applicationDeniedMessage.userMessage) {
                                    try {
                                        await this.client.controllers.discord.sendUserDM(application.userID, this.formatDiscordLogMessage(application.form.discordLog.applicationDeniedMessage.userMessage, application.user, staffMember, reason));
                                    } catch {
                                        // Fail silently
                                    }
                                }
                            }
                            break;
                        // case RecruitmentApplicationStatus.HOLD:
                        //
                        //     break;
                    }

                    // Increase the number of applications
                    await this.client.controllers.statistics.incManagementStatistics(staffMember.id, 'applications');

                    const discordMessages = application.form.discordMessages?.filter((message: RecruitmentDiscordChannelMessage) => message.status === status) ?? [];

                    for (const message of discordMessages) {
                        try {
                            await this.handleDiscordMessage(message, application.user, staffMember, reason);
                        } catch {
                            // Error silently
                        }
                    }
                }
                resolve();
            } catch (e) {

                reject(e);
            }
        });
    }

    public validateRanks(data: RecruitmentFormOptions): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const ranks = [...data.ranks, ...data.manageableRanks];
                for (const rank of ranks) {
                    const r = await this.client.controllers.rank.getRank(rank);
                    if (!r) return reject({statusCode: 400, code: 'rank_not_found', message: 'Rank not found'});
                }
                resolve(true);
            } catch (e) {

                reject(e);
            }
        });
    }

    private handleDiscordMessage(message: RecruitmentDiscordChannelMessage, user: UserOptions, staffMember?: UserOptions, reason?: string): Promise<void> {
        return new Promise(async (resolve) => {
           try {
               const msg = this.formatDiscordLogMessage(message.message, user, staffMember, reason);
               if (message.channelID === 'user') {
                   await this.client.controllers.discord.sendUserDM(user.id, msg);
               } else {
                   await this.client.controllers.discord.createMessage(message.channelID, msg);
               }
               resolve();
           } catch (e) {
               // Error silently
               resolve();
           }
        });
    }

    public canViewRecruitmentApplication(application: RecruitmentApplicationOption, user: UserOptions, allowUser: boolean = true): boolean {
        const perms = new Perms(user.permissions || 0);
        // @ts-ignore
        return (allowUser && application.user.id === user.id) || (perms.hasPermission(Permissions.RECRUITMENT_MANAGER) || perms.hasPermission(Permissions.VIEW_RECRUITMENT_RESPONSE) && application.form.manageableRanks.some((rankID: string) => user.ranks.includes(rankID)));
    }

    public formatDiscordLogMessage(message: string, user: UserOptions, staff: UserOptions = {}, reason?: string): string {
        return message
            .replaceAll('{user.id}', user.id)
            .replaceAll('{user.username}', user.username)
            .replaceAll('{user.discriminator}', user.discriminator)
            .replaceAll('{user.mention}', '<@' + user.id + '>')
            .replaceAll('{user.createdAt}', getCreationDate(user.id) as unknown as string)
            .replaceAll('{staff.id}', staff.id)
            .replaceAll('{staff.username}', staff.username)
            .replaceAll('{staff.discriminator}', staff.discriminator)
            .replaceAll('{staff.mention}', '<@' + staff.id + '>')
            .replaceAll('{staff.createdAt}', getCreationDate(staff.id) as unknown as string)
            .replaceAll('{reason}', reason || 'No reason has been provided.');
    }
}

