"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["Unclaimed"] = 0] = "Unclaimed";
    OrderStatus[OrderStatus["Claimed"] = 1] = "Claimed";
    OrderStatus[OrderStatus["Preparing"] = 2] = "Preparing";
    OrderStatus[OrderStatus["PendingDelivery"] = 3] = "PendingDelivery";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
//# sourceMappingURL=order.js.map