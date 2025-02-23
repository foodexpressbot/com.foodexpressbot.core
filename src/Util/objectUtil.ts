export default class ObjectUtil {
    public static flattenObject(obj: any, parentKey: string = '') {
        let result = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = parentKey ? `${parentKey}.${key}` : key;

                if (Array.isArray(obj[key])) {
                    // If the value is an array, keep it as is
                    result[newKey] = obj[key];
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    // Recursively flatten nested objects
                    const nestedFlatten = this.flattenObject(obj[key], newKey);
                    result = { ...result, ...nestedFlatten };
                } else {
                    // Include keys that do not need to be nested
                    result[newKey] = obj[key];
                }
            }
        }
        return result;
    }
}