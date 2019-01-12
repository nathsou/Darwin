import { Vector2D } from "./Vector2D";
import { MathUtils } from "./MathUtils";

export class Eater {

    public closest_food: Vector2D;
    public food_dir: Vector2D;
    public lookat: Vector2D;
    private _pos: Vector2D;
    private _angle: number;
    private chromosomeIdx: number;

    constructor(pos: Vector2D, angle: number, chromosomeIdx: number) {
        this._pos = pos;
        this._angle = angle;
        this.chromosomeIdx = chromosomeIdx;
    }

    getChromosomeIdx(): number {
        return this.chromosomeIdx;
    }

    get position(): Vector2D {
        return this._pos;
    }

    set position(new_pos: Vector2D) {
        this._pos = new_pos;
    }

    get angle(): number {
        return this._angle;
    }

    set angle(angle: number) {
        this._angle = angle % MathUtils.TWO_PI;
    }
}