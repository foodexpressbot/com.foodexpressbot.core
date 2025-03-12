"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFlags = exports.PerkTypes = void 0;
var PerkTypes;
(function (PerkTypes) {
    PerkTypes["PriorityOrders"] = "PRIORITY_ORDERS";
    PerkTypes["CancelOrders"] = "CANCEL_ORDERS";
    PerkTypes["OrderMultiplier"] = "ORDER_MULTIPLIER";
    PerkTypes["MultipleVanityUrls"] = "MULTIPLE_VANITY_URLS";
    PerkTypes["FasterOrder"] = "PREPARE_ORDER_FASTER";
    PerkTypes["DailyMultiplier"] = "DAILY_MULTIPLIER";
    PerkTypes["Daily12HourInterval"] = "DAILY_12_HOUR_INTERVAL";
    PerkTypes["DeliveryMessageBeta"] = "DELIVERY_MESSAGE_BETA";
    PerkTypes["FeedbackBeta"] = "FEEDBACK_BETA";
    PerkTypes["FindImagesBeta"] = "FIND_IMAGES_BETA";
})(PerkTypes = exports.PerkTypes || (exports.PerkTypes = {}));
var UserFlags;
(function (UserFlags) {
    UserFlags[UserFlags["BETA"] = 1] = "BETA";
})(UserFlags = exports.UserFlags || (exports.UserFlags = {}));
//# sourceMappingURL=user.js.map