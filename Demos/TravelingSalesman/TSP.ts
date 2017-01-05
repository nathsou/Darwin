interface Point {
    x: number,
    y: number
}

class TSP {

    private cities: Point[];
    private dist_map: Map<string, number>; //squared dist between a and b where a <= b

    constructor(cities: Point[]) {
        this.cities = cities;
        this.dist_map = new Map<string, number>();
    }

    private dist2D(cityA: number, cityB: number) : number {
        return this.dist2D_squared(cityA, cityB) ** 0.5;
    }

    private dist2D_squared(cityA: number, cityB: number) : number {
        
        let c = [cityA, cityB].sort(),
            key = `${c[0]}-${c[1]}`;

        if (this.dist_map.has(key)) 
            return this.dist_map.get(key);
        else {
            let p1 = this.cities[cityA],
                p2 = this.cities[cityB];

            let dist_sq = ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

            this.dist_map.set(key, dist_sq);

            return dist_sq;
        }
    }

    public checkPathValidity(path: number[]) : boolean { //check that each city is visited exactly once
        if (path.length !== this.cities.length) return false;

        let sorted = path.slice().sort();
        
        let prev = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            if (prev === sorted[i]) return false;
            prev = sorted[i];
        }


        return true;
    }

    public distance(path: number[]) : number {

        if (!this.checkPathValidity(path))
            throw new Error(`Invalid path: Each city must be visited exactly once.`);

        let dist = 0;

        for (let i = 1; i < path.length; i++) 
            dist += this.dist2D(path[i - 1], path[i]);

        return dist;
    }

    public distance_squared(path: number[]) : number {

        if (!this.checkPathValidity(path))
            throw new Error(`Invalid path: Each city must be visited exactly once.`);

        let dist = 0;

        for (let i = 1; i < path.length; i++) 
            dist += this.dist2D_squared(path[i - 1], path[i]);

        return dist;
    }

    public getCities() : Point[] {
        return this.cities;
    }

    public getCity(idx: number) : Point {
        return this.cities[idx];
    }

    public draw(ctx: CanvasRenderingContext2D, path: number[]) : void {
        
        if (path.length !== this.cities.length)
            throw new Error(`Each city must be visited`);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = '#01cc33';

        for (let city of this.cities) {
            ctx.beginPath();
            ctx.arc(city.x, city.y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
        
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let i = 1; i < path.length; i++) {
            ctx.moveTo(this.cities[path[i - 1]].x, this.cities[path[i - 1]].y);
            ctx.lineTo(this.cities[path[i]].x, this.cities[path[i]].y);
            ctx.stroke();
        }
        ctx.closePath();
    }

}