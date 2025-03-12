"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSnowFlake = exports.getCreationDate = void 0;
const Constants_1 = require("../Constants");
const getCreationDate = (snowflake) => {
    if (!isSnowFlake(snowflake))
        return null;
    return (Number(snowflake) / 4194304) + 1420070400000;
};
exports.getCreationDate = getCreationDate;
const isSnowFlake = (snowflake) => {
    return Constants_1.DISCORD_SNOWFLAKE_REGEX.test(String(snowflake));
    // return !isNaN(Number(snowflake)) && String(snowflake).length >= 16;
};
exports.isSnowFlake = isSnowFlake;
//# sourceMappingURL=snowflakes.js.map