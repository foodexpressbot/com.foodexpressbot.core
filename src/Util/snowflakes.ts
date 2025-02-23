import { DISCORD_SNOWFLAKE_REGEX } from '../Constants';

const getCreationDate = (snowflake: string | number): number | null => {
    if (!isSnowFlake(snowflake)) return null;
    return (Number(snowflake) / 4194304) + 1420070400000;
};

const isSnowFlake = (snowflake: string | number): boolean  => {
    return DISCORD_SNOWFLAKE_REGEX.test(String(snowflake));
    // return !isNaN(Number(snowflake)) && String(snowflake).length >= 16;
};


export {
    getCreationDate,
    isSnowFlake
};
