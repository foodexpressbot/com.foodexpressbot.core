"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToWord = exports.numberToPositon = exports.Positions = exports.Words = void 0;
var Words;
(function (Words) {
    Words[Words["ONE"] = 1] = "ONE";
    Words[Words["TWO"] = 2] = "TWO";
    Words[Words["THREE"] = 3] = "THREE";
})(Words || (exports.Words = Words = {}));
var Positions;
(function (Positions) {
    Positions["ONE"] = "First";
    Positions["TWO"] = "Second";
    Positions["THREE"] = "Third";
})(Positions || (exports.Positions = Positions = {}));
const numberToPositon = (number) => {
    return Positions[Words[number]].toLowerCase();
};
exports.numberToPositon = numberToPositon;
const numberToWord = (number) => {
    return Words[number].toLowerCase();
};
exports.numberToWord = numberToWord;
//# sourceMappingURL=numberToWord.js.map