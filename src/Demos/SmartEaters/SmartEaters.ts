import { CrossoverFunction, crossoverMethod } from "../../CrossoverMethods";
import { Darwin } from "../../Darwin";
import { createEater, Eater } from "./Eater";
import { NeuralNet } from "./NeuralNet";
import { Vector2D } from "./Vector2D";
import { MathUtils } from "./MathUtils";

export const DPR = window.devicePixelRatio;

export interface EatersParams {
    populationSize?: number,
    hiddenLayersSizes?: number[],
    foodCount?: number,
    crossoverRate?: number,
    mutationRate?: number,
    eliteCount?: number,
    eliteCopies?: number,
    maxSpeed?: number,
    maxTurnRate?: number,
    ticksPerGen?: number,
    crossoverMethod?: CrossoverFunction<number>,
    eaterSize?: number,
    foodSize?: number,
    wrapBorders?: boolean
}

export class SmartEaters {
    private genetics: Darwin<number>;
    private cnv: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private brain: NeuralNet;
    private population: Eater[];
    private food: Vector2D[];
    private ticks = 0;
    private layerSizes: number[];
    private selectedIndex = -1;
    public followFittest = false;
    private paused = false;
    private fastMode = false;
    public fastModeRefreshRate = 2;
    public statsRefreshRate = 20;
    public showLines = false;
    public hideNonSelected = false;
    public stopMating = false;
    private params: Required<EatersParams>;

    constructor(cnv: HTMLCanvasElement, params?: EatersParams) {
        this.cnv = cnv;
        const ctx = this.cnv.getContext('2d');
        if (ctx === null) {
            throw new Error(`Could not get a 2d canvas context`);
        }

        this.ctx = ctx;

        this.params = {
            populationSize: 30,
            hiddenLayersSizes: [6],
            foodCount: 40,
            crossoverRate: 0.7,
            mutationRate: 0.1,
            eliteCount: 4,
            eliteCopies: 1,
            maxSpeed: 2,
            maxTurnRate: 0.3,
            ticksPerGen: 1000,
            crossoverMethod: crossoverMethod.singlePoint,
            eaterSize: 12,
            foodSize: 5,
            wrapBorders: true,
            ...params
        };

        this.layerSizes = [4, ...this.params.hiddenLayersSizes, 2];
        this.brain = new NeuralNet();

        this.genetics = new Darwin<number>({
            populationSize: this.params.populationSize,
            randomGene: () => (Math.random() * 2) - 1,
            chromosomeLength: NeuralNet.weightsCount(this.layerSizes)
        });

        // Associate each chromosome to a Eater
        this.population = this.genetics.getPopulation().map((_, idx) =>
            createEater(this.randomPos(), Math.random() * MathUtils.TWO_PI, idx)
        );

        this.cnv.addEventListener('click', (e: MouseEvent) => {
            const mousePos = new Vector2D(e.clientX * DPR, e.clientY * DPR);

            let closestEaterIdx = 0;
            let closestEaterDist = Infinity;

            for (let i = 0; i < this.population.length; i++) {
                const distSq = this.population[i].position.distSq(mousePos);
                if (distSq < closestEaterDist) {
                    closestEaterDist = distSq;
                    closestEaterIdx = i;
                }
            }

            if (closestEaterDist ** 0.5 < this.params.eaterSize * 2 * DPR) {
                this.setSelected(closestEaterIdx);
            } else {
                this.selectedIndex = -1;
            }
        });

        this.spawnFood();
    }

    private spawnFood(): void {
        this.food = [];

        for (let i = 0; i < this.params.foodCount; i++) {
            this.food.push(this.randomPos());
        }
    }

    private randomPos(): Vector2D {
        return Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
    }

    private getClosestFood(eater: Eater): { index: number, dist: number } {
        let closestIndex = 0;
        let closestDistSq = Infinity;

        for (let i = 0; i < this.food.length; i++) {
            const dist = eater.position.distSq(this.food[i]);
            if (dist < closestDistSq) {
                closestDistSq = dist;
                closestIndex = i;
            }
        }

        return {
            index: closestIndex,
            dist: closestDistSq ** 0.5
        }
    }

    private tick(): void {
        if (!this.paused) {
            if (++this.ticks > this.params.ticksPerGen) {
                this.nextGeneration();
                this.ticks = 0;
            }

            // Update positions
            for (const eater of this.population) {
                const chromo = this.genetics.getChromosomeAt(eater.getChromosomeIndex());
                this.brain.putWeights(this.layerSizes, chromo.getGenes());

                const closestFood = this.getClosestFood(eater);
                eater.closestFood = Vector2D.clone(this.food[closestFood.index]);

                // food dir
                const [foodLeft, foodRight] = this.food[closestFood.index]
                    .sub(eater.position)
                    .normalize()
                    .toArray();

                // snack time!
                if (closestFood.dist < (this.params.eaterSize + this.params.foodSize) / 2) {
                    const f = chromo.getFitness();
                    chromo.setFitness(2 * (f === 0 ? 1 : f));
                    this.food[closestFood.index] = this.randomPos();
                }

                // lookat
                const lookat = [
                    Math.cos(eater.angle),
                    Math.sin(eater.angle)
                ];

                const [turnLeft, turnRight] = this.brain.run(...lookat, foodLeft, foodRight);

                const rotationForce = MathUtils.clamp(
                    turnLeft - turnRight,
                    -this.params.maxTurnRate,
                    this.params.maxTurnRate
                );

                eater.angle += rotationForce;
                eater.lookat = new Vector2D(lookat[0], lookat[1]);
                eater.foodDir = new Vector2D(foodLeft, foodRight);

                eater.position.plus(eater.lookat.times(this.params.maxSpeed * DPR));

                const pos = eater.position;

                if (this.params.wrapBorders) {
                    if (pos.x > this.cnv.width) pos.x = 0;
                    if (pos.x < 0) pos.x = this.cnv.width;
                    if (pos.y > this.cnv.height) pos.y = 0;
                    if (pos.y < 0) pos.y = this.cnv.height;
                } else {
                    if (pos.x > this.cnv.width) pos.x = this.cnv.width;
                    if (pos.x < 0) pos.x = 0;
                    if (pos.y > this.cnv.height) pos.y = this.cnv.height;
                    if (pos.y < 0) pos.y = 0;
                }

            }
        }
    }

    public pause(): void {
        this.paused = !this.paused;
    }

    private nextGeneration(): void {
        if (!this.stopMating) {
            this.genetics.mate();
            this.genetics.updateStats();

            // reset fitness
            for (const eater of this.genetics.getPopulation()) {
                eater.setFitness(0);
            }

            this.spawnFood();

            for (const eater of this.population) {
                eater.position = this.randomPos();
            }

            this.selectedIndex = -1;
        }
    }

    public run() {
        const update = () => {
            this.tick();
            this.render();

            if (!this.fastMode) {
                requestAnimationFrame(update);
            } else {
                setTimeout(update, 0);
            }
        };

        update();

    }

    private render(): void {
        if (!this.fastMode || this.ticks % this.fastModeRefreshRate === 0) {
            if (this.ticks % this.statsRefreshRate === 0) {
                this.genetics.updateStats(true);
            }

            this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
            this.drawFood();
            this.drawEaters();
            this.highlightSelectedEater();
            this.drawGenerationInfo();
        }
    }

    private drawGenerationInfo(): void {
        const { fittest } = this.genetics.getStats();
        const best = fittest.getFitness() !== 0
            ? Math.log2(fittest.getFitness())
            : 0;

        this.ctx.fillStyle = 'black';
        this.ctx.fillText(`Generation: ${this.genetics.getGeneration()}`, 5, 10);
        this.ctx.fillText(`avg: ${Math.log2(1 + this.genetics.getStats().averageFitness).toFixed(3)}`, 5, 25);
        this.ctx.fillText(`best: ${best}`, 5, 40);
        this.ctx.fillText(`ticks: ${this.ticks} / ${this.params.ticksPerGen}`, 5, 55);
    }

    private highlightSelectedEater(): void {
        if (this.followFittest) {
            this.selectedIndex = this.genetics.getStats().fittestIndex;
        }

        if (this.selectedIndex !== -1 && !this.hideNonSelected) {
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'red';
            this.ctx.beginPath();
            const eater = this.population[this.selectedIndex];
            const pos = eater.position;
            this.ctx.arc(pos.x / DPR, pos.y / DPR, this.params.eaterSize * 2, 0, MathUtils.TWO_PI);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'black';
            this.ctx.moveTo(pos.x / DPR, pos.y / DPR);
            const food_dir = pos.add(eater.foodDir.times(this.params.eaterSize * 2 * DPR));
            this.ctx.lineTo(food_dir.x / DPR, food_dir.y / DPR);
            this.ctx.stroke();
        }
    }

    private drawEaters(): void {
        const c1 = [46, 204, 113];
        const c2 = [255, 0, 0];

        const max = Math.log2(this.genetics.getStats().fittest.getFitness());
        let i = 0;

        for (const eater of this.population) {
            if (this.showLines) {
                this.ctx.beginPath();
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'black';
                this.ctx.moveTo(eater.position.x / DPR, eater.position.y / DPR);
                const food = eater.position.add(eater.foodDir.times(eater.position.dist(eater.closestFood)));
                this.ctx.lineTo(food.x / DPR, food.y / DPR);
                this.ctx.stroke();
            }

            if (!(this.hideNonSelected && this.selectedIndex !== undefined && i++ !== this.selectedIndex)) {
                const fitness = Math.log2(this.genetics.getChromosomeAt(eater.getChromosomeIndex()).getFitness());

                const [r, g, b] = [
                    MathUtils.clamp(MathUtils.map(fitness, 0, max, c1[0], c2[0]), Math.min(c1[0], c2[0]), Math.max(c1[0], c2[0])),
                    MathUtils.clamp(MathUtils.map(fitness, 0, max, c1[1], c2[1]), Math.min(c1[1], c2[1]), Math.max(c1[1], c2[1])),
                    MathUtils.clamp(MathUtils.map(fitness, 0, max, c1[2], c2[2]), Math.min(c1[2], c2[2]), Math.max(c1[2], c2[2]))
                ];

                this.ctx.lineWidth = 4;
                this.ctx.fillStyle = `rgb(
                    ${Math.floor(r)},
                    ${Math.floor(g)},
                    ${Math.floor(b)}
                )`;

                this.ctx.beginPath();
                const la = eater.lookat.times(this.params.eaterSize * DPR).add(eater.position);
                const alpha = la.sub(eater.position).angle();
                const beta = Math.PI / 1.3;
                const u = new Vector2D(Math.cos(alpha + beta), Math.sin(alpha + beta));
                const v = new Vector2D(Math.cos(alpha - beta), Math.sin(alpha - beta));
                const p1 = eater.position.add(u.times(this.params.eaterSize * DPR));
                const p2 = eater.position.add(v.times(this.params.eaterSize * DPR));
                this.ctx.moveTo(p1.x / DPR, p1.y / DPR);
                this.ctx.lineTo(la.x / DPR, la.y / DPR);
                this.ctx.lineTo(p2.x / DPR, p2.y / DPR);
                this.ctx.fill();
            }
        }
    }

    private drawFood(): void {
        this.ctx.fillStyle = 'rgb(52, 73, 94)';
        const fs = this.params.foodSize;
        for (const food of this.food) {
            this.ctx.beginPath();
            this.ctx.fillRect((food.x - fs / 2) / DPR, (food.y - fs / 2) / DPR, fs, fs);
            this.ctx.fill();
        }
    }

    public setSelected(index: number): void {
        this.followFittest = false;
        this.selectedIndex = index;
    }

    public getSelected(): Eater {
        return this.population[this.selectedIndex];
    }

    public getEater(idx: number): Eater {
        return this.population[idx];
    }

    public toggleFastMode(): void {
        this.fastMode = !this.fastMode;
    }

    public getDarwinInstance(): Darwin<number> {
        return this.genetics;
    }

    public toggleMating(): void {
        this.stopMating = !this.stopMating;
    }

    public getSelectedIndex(): number {
        return this.selectedIndex;
    }

    public getParameters(): Readonly<EatersParams> {
        return this.params;
    }
}