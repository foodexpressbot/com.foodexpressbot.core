import log from 'clean-logger';

export default class Logger {
    public static success(...args) {
        log(...args);
    }

    public static info(...args) {
        log.info(...args);
    }

    public static error(...args) {
        log.error(...args);
    }


}
