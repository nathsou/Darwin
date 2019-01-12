export declare class Vector2D {
    x: number;
    y: number;
    constructor(x: number, y: number);
    add(v: Vector2D): Vector2D;
    sub(v: Vector2D): Vector2D;
    plus(v: Vector2D): void;
    minus(v: Vector2D): void;
    dot(v: Vector2D): number;
    hadamard(v: Vector2D | number[]): Vector2D;
    norm(): number;
    norm_sq(): number;
    times(k: number): Vector2D;
    normalize(): Vector2D;
    dist(v: Vector2D): number;
    dist_sq(v: Vector2D): number;
    map(f: (x: number) => number): Vector2D;
    angle(): number;
    toArray(): number[];
    fromArray(arr: number[]): Vector2D;
    static fill(n: number): Vector2D;
    static zeroes(): Vector2D;
    static ones(): Vector2D;
    static rand(): Vector2D;
    static clone(v: Vector2D): Vector2D;
}
