import dateUtil from './dateUtil';

export default (date: number): number => {
    return dateUtil().diff(date, 'years');
};
