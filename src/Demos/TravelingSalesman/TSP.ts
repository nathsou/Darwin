
export interface Point {
    x: number,
    y: number
}

export class TSP {
    private cities: Point[];
    // squared distance between a and b where a <= b
    private distMap: Map<string, number>;

    constructor(cities: Point[]) {
        this.cities = cities;
        this.distMap = new Map<string, number>();
    }

    private dist2D(cityA: number, cityB: number): number {
        return this.dist2DSquared(cityA, cityB) ** 0.5;
    }

    private dist2DSquared(cityA: number, cityB: number): number {
        let city1: number;
        let city2: number;

        if (cityB > cityA) {
            city1 = cityA;
            city2 = cityB;
        } else {
            city1 = cityB;
            city2 = cityA;
        }

        const key = `${city1}->${city2}`;

        if (this.distMap.has(key)) {
            return this.distMap.get(key) as number;
        } else {
            let p1 = this.cities[cityA];
            let p2 = this.cities[cityB];

            const distSq = ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            this.distMap.set(key, distSq);

            return distSq;
        }
    }

    // check that each city is visited exactly once
    public checkPathValidity(path: number[]): boolean {
        if (path.length !== this.cities.length) {
            return false
        };

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

    public distance(path: number[]): number {
        if (!this.checkPathValidity(path)) {
            throw new Error(`Invalid path: Each city must be visited exactly once.`);
        }

        let dist = 0;

        for (let i = 1; i < path.length; i++) {
            dist += this.dist2D(path[i - 1], path[i]);
        }

        return dist;
    }

    public distanceSquared(path: number[]): number {
        if (!this.checkPathValidity(path)) {
            throw new Error(`Invalid path: Each city must be visited exactly once.`);
        }

        let dist = 0;

        for (let i = 1; i < path.length; i++) {
            dist += this.dist2DSquared(path[i - 1], path[i]);
        }

        return dist;
    }

    public getCities(): Point[] {
        return this.cities;
    }

    public getCity(idx: number): Point {
        return this.cities[idx];
    }

    public draw(ctx: CanvasRenderingContext2D, path: number[]): void {
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