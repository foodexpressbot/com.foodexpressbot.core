"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_PURGE_AMOUNT = exports.DISCORD_SNOWFLAKE_REGEX = exports.APPEAL_MIN_VOTE_COUNT = exports.KNOWLEDGE_BASE_AGGREGATE_FIELDS = exports.USER_AGGREGATE_FIELDS = exports.USER_PRONOUNS = void 0;
exports.USER_PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'It/Its', 'Il/lui', 'Ze/Zir', 'Neopronouns', 'Any', 'Ask me'];
const USER_AGGREGATE_FIELDS = (key = 'user') => [key + '._id', key + '.username', key + '.discriminator', key + '.avatar', key + '.ranks', key + '.permissions'];
exports.USER_AGGREGATE_FIELDS = USER_AGGREGATE_FIELDS;
const KNOWLEDGE_BASE_AGGREGATE_FIELDS = (key = 'article') => [key + '._id', key + '.name', key + '.tags', key + '.category', key + '.information', key + '.allowedRanks', key + '.createdBy' + key + '.createdAt', key + '.updatedAt'];
exports.KNOWLEDGE_BASE_AGGREGATE_FIELDS = KNOWLEDGE_BASE_AGGREGATE_FIELDS;
exports.APPEAL_MIN_VOTE_COUNT = 3;
exports.DISCORD_SNOWFLAKE_REGEX = /^[0-9]{17,19}$/;
exports.ORDER_PURGE_AMOUNT = 20;
//# sourceMappingURL=constants.js.map