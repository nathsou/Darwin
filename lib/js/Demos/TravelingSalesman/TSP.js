"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSP = void 0;
class TSP {
    constructor(cities) {
        this.cities = cities;
        this.distMap = new Map();
    }
    dist2D(cityA, cityB) {
        return Math.pow(this.dist2DSquared(cityA, cityB), 0.5);
    }
    dist2DSquared(cityA, cityB) {
        let city1;
        let city2;
        if (cityB > cityA) {
            city1 = cityA;
            city2 = cityB;
        }
        else {
            city1 = cityB;
            city2 = cityA;
        }
        const key = `${city1}->${city2}`;
        if (this.distMap.has(key)) {
            return this.distMap.get(key);
        }
        else {
            let p1 = this.cities[cityA];
            let p2 = this.cities[cityB];
            const distSq = (Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
            this.distMap.set(key, distSq);
            return distSq;
        }
    }
    // check that each city is visited exactly once
    checkPathValidity(path) {
        if (path.length !== this.cities.length) {
            return false;
        }
        ;
        let sorted = path.slice().sort();
        let prev = sorted[0];
        for (let i = 1; i < sorted.length; i++) {
            if (prev === sorted[i]) {
                return false;
            }
            prev = sorted[i];
        }
        return true;
    }
    distance(path) {
        if (!this.checkPathValidity(path)) {
            throw new Error(`Invalid path: Each city must be visited exactly once.`);
        }
        let dist = 0;
        for (let i = 1; i < path.length; i++) {
            dist += this.dist2D(path[i - 1], path[i]);
        }
        return dist;
    }
    distanceSquared(path) {
        if (!this.checkPathValidity(path)) {
            throw new Error(`Invalid path: Each city must be visited exactly once.`);
        }
        let dist = 0;
        for (let i = 1; i < path.length; i++) {
            dist += this.dist2DSquared(path[i - 1], path[i]);
        }
        return dist;
    }
    getCities() {
        return this.cities;
    }
    getCity(idx) {
        return this.cities[idx];
    }
    draw(ctx, path) {
        if (path.length !== this.cities.length) {
            throw new Error(`Each city must be visited`);
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const dpr = window.devicePixelRatio;
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 2;
        for (let i = 1; i < path.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.cities[path[i - 1]].x / dpr, this.cities[path[i - 1]].y / dpr);
            ctx.lineTo(this.cities[path[i]].x / dpr, this.cities[path[i]].y / dpr);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.fillStyle = '#01cc33';
        for (const city of this.cities) {
            ctx.beginPath();
            ctx.arc(city.x / dpr, city.y / dpr, 4, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
        }
    }
}
exports.TSP = TSP;
