"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dateUtil_1 = __importDefault(require("./dateUtil"));
exports.default = (date) => {
    return (0, dateUtil_1.default)().diff(date, 'years');
};
//# sourceMappingURL=getAgeFromDate.js.map