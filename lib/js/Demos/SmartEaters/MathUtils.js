"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtils = void 0;
var MathUtils;
(function (MathUtils) {
    MathUtils.clamp = (value, min, max) => {
        if (value >= min && value <= max)
            return value;
        if (value < min)
            return min;
        return max;
    };
    MathUtils.map = (value, start1, stop1, start2, stop2) => {
        return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    };
    MathUtils.TWO_PI = 2 * Math.PI;
})(MathUtils = exports.MathUtils || (exports.MathUtils = {}));
