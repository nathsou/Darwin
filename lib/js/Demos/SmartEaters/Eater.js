"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MathUtils_1 = require("./MathUtils");
class Eater {
    constructor(pos, angle, chromosomeIdx) {
        this._pos = pos;
        this._angle = angle;
        this.chromosomeIdx = chromosomeIdx;
    }
    getChromosomeIdx() {
        return this.chromosomeIdx;
    }
    get position() {
        return this._pos;
    }
    set position(new_pos) {
        this._pos = new_pos;
    }
    get angle() {
        return this._angle;
    }
    set angle(angle) {
        this._angle = angle % MathUtils_1.MathUtils.TWO_PI;
    }
}
exports.Eater = Eater;
