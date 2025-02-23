import { Generator } from 'snowflake-generator';

const SnowflakeGen = new Generator();

export default class Snowflake {
    public static generate(): any {
        return SnowflakeGen.generate().toString();
    }

    public static getInfo(snowflake: string): any {
        return SnowflakeGen.deconstruct(snowflake);
    }
}
