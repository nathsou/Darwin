"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }
    plus(v) {
        this.x += v.x;
        this.y += v.y;
    }
    minus(v) {
        this.x -= v.x;
        this.y -= v.y;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    hadamard(v) {
        if (v instanceof Vector2D)
            return new Vector2D(this.x * v.x, this.y * v.y);
        return new Vector2D(this.x * v[0], this.y * v[1]);
    }
    norm() {
        return Math.pow(this.dot(this), 0.5);
    }
    norm_sq() {
        return this.dot(this);
    }
    times(k) {
        return new Vector2D(this.x * k, this.y * k);
    }
    normalize() {
        return this.times(1 / this.norm());
    }
    dist(v) {
        return this.sub(v).norm();
    }
    dist_sq(v) {
        return this.sub(v).norm_sq();
    }
    map(f) {
        return new Vector2D(f(this.x), f(this.y));
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    toArray() {
        return [this.x, this.y];
    }
    fromArray(arr) {
        return new Vector2D(arr[0], arr[1]);
    }
    static fill(n) {
        return new Vector2D(n, n);
    }
    static zeroes() {
        return Vector2D.fill(0);
    }
    static ones() {
        return Vector2D.fill(1);
    }
    static rand() {
        return new Vector2D(Math.random(), Math.random());
    }
    static clone(v) {
        return new Vector2D(v.x, v.y);
    }
}
exports.Vector2D = Vector2D;
