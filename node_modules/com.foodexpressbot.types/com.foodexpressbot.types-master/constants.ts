export const USER_PRONOUNS: string[] = ['He/Him', 'She/Her', 'They/Them', 'It/Its', 'Il/lui', 'Ze/Zir', 'Neopronouns', 'Any', 'Ask me'];

export const USER_AGGREGATE_FIELDS = (key: string = 'user') => [key + '._id', key + '.username', key + '.discriminator', key + '.avatar', key + '.ranks', key + '.permissions'];

export const KNOWLEDGE_BASE_AGGREGATE_FIELDS = (key: string = 'article') => [key + '._id', key + '.name', key + '.tags', key + '.category', key + '.information', key + '.allowedRanks', key + '.createdBy' + key + '.createdAt', key + '.updatedAt'];

export const APPEAL_MIN_VOTE_COUNT = 3;

export const DISCORD_SNOWFLAKE_REGEX = /^[0-9]{17,19}$/;

export const ORDER_PURGE_AMOUNT = 20;
