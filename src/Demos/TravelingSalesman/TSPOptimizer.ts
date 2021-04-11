import { Darwin } from "../../Darwin";
import { mutationMethod } from "../../MutationMethod";
import { Point, TSP } from "./TSP";
import { crossoverMethod } from "../../CrossoverMethods";
import { shuffle } from "./Utils";

export class TSPOptimizer {
    private CITY_COUNT: number;
    private genetics: Darwin<number>;
    private tsp: TSP;
    private shuffled: number[] = [];
    private model: number[] = [];
    private convergenceThreshold = 30;
    private maxGenerations = 5000;
    private fitnessFactor = 15;
    private bestPath: number[];

    constructor(cities: Point[] = []) {
        this.CITY_COUNT = cities.length;
        this.tsp = new TSP(cities);

        for (let i = 0; i < this.CITY_COUNT; i++) {
            this.model[i] = i;
        }

        this.genetics = new Darwin<number>({
            populationSize: 500,
            chromosomeLength: this.CITY_COUNT,
            randGene: (() => {
                if (this.shuffled.length === 0) {
                    this.shuffled = shuffle(this.model);
                }
                return this.shuffled.pop();
            }).bind(this),
            crossoverMethod: crossoverMethod.ordered,
            mutationMethod: mutationMethod.swap,
            eliteCount: 5
        });

        const rectWidth = cities.reduce((a: number, b: Point) => a > b.x ? a : b.x, 0);
        const rectHeight = cities.reduce((a: number, b: Point) => a > b.y ? a : b.y, 0);

        this.fitnessFactor *= avgRectDist(rectWidth, rectHeight) * this.CITY_COUNT;
        this.bestPath = this.genetics.getFittest().getGenes();
    }

    private pathFitness(path: number[]): number {
        return 2 ** (this.fitnessFactor / this.tsp.distance(path));
    }

    private distanceFromFitness(fitness: number): number {
        return this.fitnessFactor / Math.log2(fitness);
    }

    private newGen(): void {
        this.genetics.updateFitness(path => this.pathFitness(path));
        this.genetics.mate();
    }

    public *optimize(): IterableIterator<number[]> {
        let minDist = Infinity;
        let count = 0;

        while (this.genetics.getGeneration() !== this.maxGenerations && count !== this.convergenceThreshold) {
            this.newGen();
            const fittest = this.genetics.getFittest();

            // this.distanceFromFitness(fittest.getFitness());
            const dist = this.tsp.distanceSquared(fittest.getGenes());
            if (dist >= minDist) {
                count++;
            } else {
                minDist = dist;
                this.bestPath = [...fittest.getGenes()];
                count = 0;
            }

            yield this.bestPath;
        }

        return this.bestPath;

    }

    public drawShortestPath(ctx: CanvasRenderingContext2D): void {
        this.tsp.draw(ctx, this.bestPath);

        ctx.fillStyle = 'black';
        ctx.fillText(`generation : ${this.genetics.getGeneration()}`, 5, 15);
        ctx.fillText(`avg dist : ${this.distanceFromFitness(this.genetics.getAverageFitness()).toFixed(0)}`, 5, 30);
    }

    public getGeneration(): number {
        return this.genetics.getGeneration();
    }

}

//http://www.math.uni-muenster.de/reine/u/burgstal/d18.pdf
function avgRectDist(w: number, h: number) {
    const w2 = w ** 2;
    const w3 = w ** 3;
    const h2 = h ** 2;
    const h3 = h ** 3;
    const d = (w2 + h2) ** 0.5;

    return (1 / 15) * (w3 / h2 + h3 / w2 + d *
        (3 - w2 / h2 - h2 / w2) + 2.5 * ((h2 / w) *
            Math.log((w + d) / h) + (w2 / h) * Math.log((h + d) / w)));
}