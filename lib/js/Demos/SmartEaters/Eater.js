"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eater = void 0;
const MathUtils_1 = require("./MathUtils");
class Eater {
    constructor(pos, angle, chromosomeIdx) {
        this.pos = pos;
        this.angle = angle;
        this.chromosomeIdx = chromosomeIdx;
    }
    getChromosomeIdx() {
        return this.chromosomeIdx;
    }
    getPosition() {
        return this.pos;
    }
    setPosition(newPosition) {
        this.pos = newPosition;
    }
    getAngle() {
        return this.angle;
    }
    setAngle(angle) {
        this.angle = angle % MathUtils_1.MathUtils.TWO_PI;
    }
}
exports.Eater = Eater;
