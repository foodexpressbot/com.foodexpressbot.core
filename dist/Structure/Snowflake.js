"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snowflake_generator_1 = require("snowflake-generator");
const SnowflakeGen = new snowflake_generator_1.Generator();
class Snowflake {
    static generate() {
        return SnowflakeGen.generate().toString();
    }
    static getInfo(snowflake) {
        return SnowflakeGen.deconstruct(snowflake);
    }
}
exports.default = Snowflake;
//# sourceMappingURL=Snowflake.js.map