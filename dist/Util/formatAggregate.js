"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (data, useId = true, rawProjection) => {
    const projection = {};
    if (useId) {
        // projection['_id'] = false;
        projection[typeof useId === 'string' ? useId : 'id'] = '$_id';
    }
    for (const field of data) {
        projection[field] = true;
    }
    if (rawProjection) {
        for (const [key, value] of Object.entries(rawProjection)) {
            if (projection[key])
                continue;
            projection[key] = value;
        }
    }
    return projection;
};
//# sourceMappingURL=formatAggregate.js.map