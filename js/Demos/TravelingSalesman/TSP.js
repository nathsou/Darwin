class TSP {
    constructor(cities) {
        this.cities = cities;
    }
    static dist2D(p1, p2) {
        return Math.sqrt((Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2)));
    }
    static dist2D_squared(p1, p2) {
        return (Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    }
    checkPathValidity(path) {
        if (path.length !== this.cities.length)
            return false;
        let sorted = path.slice().sort();
        let prev = sorted[0];
        for (let i = 1; i < sorted.length; i++) {
            if (prev === sorted[i])
                return false;
            prev = sorted[i];
        }
        return true;
    }
    distance(path) {
        if (!this.checkPathValidity(path))
            throw new Error(`Invalid path: Each city must be visited exactly once.`);
        let dist = 0;
        for (let i = 1; i < path.length; i++)
            dist += TSP.dist2D(this.cities[path[i - 1]], this.cities[path[i]]);
        return dist;
    }
    distance_squared(path) {
        if (!this.checkPathValidity(path))
            throw new Error(`Invalid path: Each city must be visited exactly once.`);
        let dist = 0;
        for (let i = 1; i < path.length; i++)
            dist += TSP.dist2D_squared(this.cities[path[i - 1]], this.cities[path[i]]);
        return dist;
    }
    getCities() {
        return this.cities;
    }
    getCity(idx) {
        return this.cities[idx];
    }
    draw(ctx, path) {
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
