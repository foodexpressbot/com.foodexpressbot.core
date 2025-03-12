"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppealStatus = exports.AppealType = void 0;
var AppealType;
(function (AppealType) {
    AppealType[AppealType["DiscordBan"] = 1] = "DiscordBan";
    AppealType[AppealType["UserBlacklist"] = 2] = "UserBlacklist";
    AppealType[AppealType["ServerBlacklist"] = 3] = "ServerBlacklist";
})(AppealType = exports.AppealType || (exports.AppealType = {}));
var AppealStatus;
(function (AppealStatus) {
    AppealStatus[AppealStatus["PENDING"] = 0] = "PENDING";
    AppealStatus[AppealStatus["ON_HOLD"] = 1] = "ON_HOLD";
    AppealStatus[AppealStatus["ACCEPTED"] = 2] = "ACCEPTED";
    AppealStatus[AppealStatus["DENIED"] = 3] = "DENIED";
})(AppealStatus = exports.AppealStatus || (exports.AppealStatus = {}));
//# sourceMappingURL=appeal.js.map