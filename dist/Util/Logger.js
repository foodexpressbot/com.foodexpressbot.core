"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clean_logger_1 = __importDefault(require("clean-logger"));
class Logger {
    static success(...args) {
        (0, clean_logger_1.default)(...args);
    }
    static info(...args) {
        clean_logger_1.default.info(...args);
    }
    static error(...args) {
        clean_logger_1.default.error(...args);
    }
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map