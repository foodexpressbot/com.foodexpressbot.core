export default (data: string[], useId: boolean | string = true, rawProjection?: object) : object => {
    const projection: object = {};
    if (useId) {
        // projection['_id'] = false;
        projection[typeof useId === 'string' ? useId : 'id'] = '$_id';
    }
    for (const field of data) {
        projection[field] = true;
    }
    if (rawProjection) {
        for (const [key, value] of Object.entries(rawProjection)) {
            if (projection[key]) continue;
            projection[key] = value;
        }
    }
    return projection;
}
