const convertString = (value: string): any => {
    if (typeof value !== 'string') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;

    // Check if the value is a json object
    if (value?.startsWith('{') && value?.endsWith('}') || value?.startsWith('[') && value?.endsWith(']')) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    return value;
};

const convertObjectValues = (object: object): any => {
    try {
        const result = {};

        // Check if the value is a json object
        for (const [key, value] of Object.entries(object)) {
            result[key] = convertString(value);
        }

        return result;
    } catch  {
        return object;
    }
};


export default convertString;

export {
    convertObjectValues
};