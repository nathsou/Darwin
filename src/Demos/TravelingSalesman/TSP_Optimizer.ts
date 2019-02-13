import { Darwin } from "../../Darwin";
import { MutationMethod } from "../../MutationMethod";
import { Point, TSP } from "./TSP";
import { CrossoverMethod } from "../../CrossoverMethods";
import { shuffle } from "./Utils";

export class TSP_Optimizer {

    private CITY_COUNT: number;
    private genetics: Darwin<number>;
    private tsp: TSP;
    private shuffled: number[] = [];
    private model: number[] = [];
    private convergence_treshold = 30;
    private max_generation = 5000;
    private fitness_k = 15;
    private best_path: number[];

    constructor(cities: Point[] = []) {
        this.CITY_COUNT = cities.length;
        this.tsp = new TSP(cities);

        for (let i = 0; i < this.CITY_COUNT; i++) {
            this.model[i] = i;
        }

        this.genetics = new Darwin<number>({
            population_size: 500,
            chromosome_length: this.CITY_COUNT,
            rand_func: (() => {
                if (this.shuffled.length === 0) {
                    this.shuffled = shuffle(this.model);
                }
                return this.shuffled.pop();
            }).bind(this),
            crossover_method: CrossoverMethod.ORDERED,
            mutation_method: MutationMethod.SWAP,
            elite_count: 5
        });

        let rect_w = cities.reduce((a: number, b: Point) => a > b.x ? a : b.x, 0),
            rect_h = cities.reduce((a: number, b: Point) => a > b.y ? a : b.y, 0);

        this.fitness_k *= avg_dist_rect(rect_w, rect_h) * this.CITY_COUNT;
        this.best_path = this.genetics.getFittest().getGenes();
    }

    private pathFitness(path: number[]): number {
        return 2 ** (this.fitness_k / this.tsp.distance(path));
    }

    private distanceFromFitness(fitness: number): number {
        return this.fitness_k / Math.log2(fitness);
    }

    private newGen(): void {
        this.genetics.updateFitness(path => this.pathFitness(path));
        this.genetics.mate();
    }

    public *optimize(): IterableIterator<number[]> {

        let min_dist = Infinity, count = 0;

        while (this.genetics.getGeneration() !== this.max_generation && count !== this.convergence_treshold) {
            this.newGen();
            const fittest = this.genetics.getFittest();

            const dist = this.tsp.distance_squared(fittest.getGenes()) // this.distanceFromFitness(fittest.getFitness());
            if (dist >= min_dist) {
                count++;
            } else {
                min_dist = dist;
                this.best_path = [...fittest.getGenes()];
                count = 0;
            }

            yield this.best_path;
        }

        return this.best_path;

    }

    public drawShortestPath(ctx: CanvasRenderingContext2D): void {
        this.tsp.draw(ctx, this.best_path);

        ctx.fillStyle = 'black';
        ctx.fillText(`generation : ${this.genetics.getGeneration()}`, 5, 15);
        ctx.fillText(`avg dist : ${this.distanceFromFitness(this.genetics.getAverageFitness()).toFixed(0)}`, 5, 30);
    }

    public getGeneration(): number {
        return this.genetics.getGeneration();
    }

}

//http://www.math.uni-muenster.de/reine/u/burgstal/d18.pdf
function avg_dist_rect(w: number, h: number) {

    const w2 = w ** 2;
    const w3 = w ** 3;
    const h2 = h ** 2;
    const h3 = h ** 3;
    const d = (w2 + h2) ** 0.5;

    return (1 / 15) * (w3 / h2 + h3 / w2 + d *
        (3 - w2 / h2 - h2 / w2) + 2.5 * ((h2 / w) *
            Math.log((w + d) / h) + (w2 / h) * Math.log((h + d) / w)));
}