
export class Vector2D {
    constructor(public x: number, public y: number) { }

    public add(v: Vector2D): Vector2D {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    public sub(v: Vector2D): Vector2D {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    public plus(v: Vector2D): void {
        this.x += v.x;
        this.y += v.y;
    }

    public minus(v: Vector2D): void {
        this.x -= v.x;
        this.y -= v.y;
    }

    public dot(v: Vector2D): number {
        return this.x * v.x + this.y * v.y;
    }

    public hadamard(v: Vector2D | number[]): Vector2D {

        if (v instanceof Vector2D)
            return new Vector2D(this.x * v.x, this.y * v.y);

        return new Vector2D(this.x * v[0], this.y * v[1]);
    }

    public norm(): number {
        return this.dot(this) ** 0.5;
    }

    public normSq(): number {
        return this.dot(this);
    }

    public times(k: number): Vector2D {
        return new Vector2D(this.x * k, this.y * k);
    }

    public normalize(): Vector2D {
        return this.times(1 / this.norm());
    }

    public dist(v: Vector2D): number {
        return this.sub(v).norm();
    }

    public distSq(v: Vector2D): number {
        return this.sub(v).normSq();
    }

    public map(f: (x: number) => number): Vector2D {
        return new Vector2D(f(this.x), f(this.y));
    }

    public angle(): number {
        return Math.atan2(this.y, this.x);
    }

    public toArray(): number[] {
        return [this.x, this.y];
    }

    public fromArray(arr: number[]): Vector2D {
        return new Vector2D(arr[0], arr[1]);
    }

    static fill(n: number): Vector2D {
        return new Vector2D(n, n);
    }

    static zeroes(): Vector2D {
        return Vector2D.fill(0);
    }

    static ones(): Vector2D {
        return Vector2D.fill(1);
    }

    static rand(): Vector2D {
        return new Vector2D(Math.random(), Math.random());
    }

    static clone(v: Vector2D): Vector2D {
        return new Vector2D(v.x, v.y);
    }
}