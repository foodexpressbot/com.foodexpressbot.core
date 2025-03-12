import { PerkTypes } from './user';
export interface RankOptions {
    _id?: string;
    id?: string;
    name?: string;
    description?: string;
    colour?: string;
    position?: number;
    roleIDs?: string[];
    staffRank?: boolean;
    useTeams?: boolean;
    logUserRankHistory?: boolean;
    displayOnTeam?: boolean;
    permissions?: number;
    perks?: PerkTypes;
    staff?: {
        canResign?: boolean;
    };
    orders?: {
        quota?: number;
    };
}
export declare enum Permissions {
    VIEW_STAFF_DASHBOARD = 1,
    MANAGE_ORDERS = 2,
    VIEW_FOOD_LOOKUP = 4,
    MANAGE_APPEALS = 8,
    MANAGE_APPEALS_ADMIN = 16,
    VIEW_BACKLOG = 32,
    MANAGE_FOOD_LOOKUP = 64,
    SUBMIT_ON_LEAVE_REQUEST = 128,
    MANAGE_ON_LEAVE_REQUESTS = 256,
    MANAGE_USERS = 512,
    UPDATE_USER_RANK = 1024,
    BAN_USERS = 2048,
    MANAGE_STAFF_REMOVALS = 4096,
    MANAGE_BLACKLISTS = 8192,
    MANAGE_RANKS = 16384,
    BYPASS_PURGE = 32768,
    MANAGE_DELIVERY_MESSAGES = 65536,
    VIEW_RECRUITMENT_RESPONSE = 131072,
    RECRUITMENT_MANAGER = 262144,
    MANAGE_WARNINGS = 524288,
    MANAGE_KNOWLEDGE_BASE = 1048576,
    VIEW_MANAGEMENT_STATISTICS = 2097152,
    MANAGE_MANAGEMENT_STATISTICS = 4194304,
    SUPER_ADMIN = 8388608,
    VIEW_OWN_ACHIEVEMENTS = 16777216,
    MANAGE_ACHIEVEMENTS = 33554432,
    MANAGE_TEAMS = 67108864,
    MANAGE_SETTINGS = 134217728,
    MANAGE_ANNOUNCEMENT = 268435456
}
export declare enum Perms {
    ViewStaffDashboard = 1,
    ManageOrders = 2,
    ViewFoodLookup = 4,
    ManageAppeals = 8,
    ManageAppealsAdmin = 16,
    ViewBacklog = 32,
    ManageFoodLookup = 64,
    SubmitOnLeaveRequest = 128,
    ManageOnLeaveRequests = 256,
    ManageUsers = 512,
    UpdateUserRanks = 1024,
    BanUsers = 2048,
    ManageStaffRemovals = 4096,
    ManageBlacklists = 8192,
    ManageRanks = 16384,
    BypassPurge = 32768,
    ManageDeliveryMessages = 65536,
    ViewRecruitmentResponse = 131072,
    RecruitmentManager = 262144,
    ManageWarnings = 524288,
    ManageKnowledgeBase = 1048576,
    ViewManagementStatistics = 2097152,
    ManageManagementStatistics = 4194304,
    SuperAdmin = 8388608
}
export declare enum PermissionNodes {
    ViewStaffDashboard = 1,
    ManageOrders = 2,
    ViewFoodLookup = 4,
    ManageAppeals = 8,
    ManageAppealsAdmin = 16,
    ViewBacklog = 32,
    ManageFoodLookup = 64,
    SubmitOnLeaveRequest = 128,
    ManageOnLeaveRequests = 256,
    ManageUsers = 512,
    UpdateUserRanks = 1024,
    BanUsers = 2048,
    ManageStaffRemovals = 4096,
    ManageBlacklists = 8192,
    ManageRanks = 16384,
    BypassPurge = 32768,
    ManageDeliveryMessages = 65536,
    ViewRecruitmentResponse = 131072,
    RecruitmentManager = 262144,
    ManageWarnings = 524288,
    ManageKnowledgeBase = 1048576,
    ViewManagementStatistics = 2097152,
    ManageManagementStatistics = 4194304,
    SuperAdmin = 8388608,
    ViewOwnAchievements = 16777216,
    ManageAchievements = 33554432,
    ManageTeams = 67108864,
    ManageSettings = 134217728,
    ManageAnnouncement = 268435456
}
//# sourceMappingURL=rank.d.ts.map