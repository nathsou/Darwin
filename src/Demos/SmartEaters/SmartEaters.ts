import { CrossoverMethod } from "../../CrossoverMethods";
import { Darwin } from "../../Darwin";
import { Eater } from "./Eater";
import { NeuralNet, NeuralNetFunction } from "./NeuralNet";
import { Vector2D } from "./Vector2D";
import { MathUtils } from "./MathUtils";

export const DPR = window.devicePixelRatio;

export interface EatersParams {
    population_size?: number,
    hidden_layers_sizes?: number[],
    food_count?: number,
    crossover_rate?: number,
    mutation_rate?: number,
    elite_count?: number,
    elite_copies?: number,
    max_speed?: number,
    max_turn_rate?: number,
    ticks_per_gen?: number,
    crossover_method?: CrossoverMethod,
    eater_size?: number,
    food_size?: number,
    wrap_borders?: boolean
}

export class SmartEaters {

    private genetics: Darwin<number>;
    private cnv: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private brain: NeuralNet;
    private population: Eater[];
    private food: Vector2D[];
    private ticks = 0;
    private layer_sizes: number[];
    private selected_idx = -1;
    public follow_fittest = false;
    private paused = false;
    private fast_mode = false;
    public fast_mode_refresh_rate = 2;
    public show_lines = false;
    public hide_non_selected = false;
    public stop_mating = false;
    private params: EatersParams;

    constructor(cnv: HTMLCanvasElement, params?: EatersParams) {
        this.cnv = cnv;
        this.ctx = this.cnv.getContext('2d');

        let choose = (a: any, b: any): any => { //won't automatically choose b if a == 0
            if (a === null || a === undefined) return b;
            return a;
        };

        //default params
        this.params = params || {};
        this.params.population_size = this.params.population_size || 30;
        this.params.hidden_layers_sizes = this.params.hidden_layers_sizes || [6];
        this.params.food_count = this.params.food_count || 40;
        this.params.crossover_rate = choose(this.params.crossover_rate, 0.7);
        this.params.mutation_rate = choose(this.params.mutation_rate, 0.1);
        this.params.elite_count = choose(this.params.elite_count, 4);
        this.params.elite_copies = choose(this.params.elite_copies, 1);
        this.params.max_speed = this.params.max_speed || 2;
        this.params.max_turn_rate = this.params.max_turn_rate || 0.3;
        this.params.ticks_per_gen = this.params.ticks_per_gen || 1000;
        this.params.crossover_method = choose(this.params.crossover_method, CrossoverMethod.SINGLE_POINT);
        this.params.eater_size = this.params.eater_size || 12;
        this.params.food_size = this.params.food_size || 5;
        this.params.wrap_borders = choose(this.params.wrap_borders, true);

        this.layer_sizes = [4, ...this.params.hidden_layers_sizes, 2];

        this.brain = new NeuralNet();

        this.genetics = new Darwin<number>({
            population_size: this.params.population_size,
            rand_func: () => (Math.random() * 2) - 1,
            chromosome_length: NeuralNet.weightsCount(this.layer_sizes)
        });

        //Associate each chromosome to a Eater
        this.population = this.genetics.getPopulation().map(
            (_, idx) => new Eater(this.randomPos(), Math.random() * MathUtils.TWO_PI, idx)
        );

        this.cnv.addEventListener('click', (e: MouseEvent) => {
            const mouse_pos = new Vector2D(e.clientX * DPR, e.clientY * DPR);

            let closest_eater_idx = 0, closest_eater_dist = Infinity;

            for (let i = 0; i < this.population.length; i++) {
                const dist_sq = this.population[i].position.dist_sq(mouse_pos);
                if (dist_sq < closest_eater_dist) {
                    closest_eater_dist = dist_sq;
                    closest_eater_idx = i;
                }
            }

            if (closest_eater_dist ** 0.5 < this.params.eater_size * 2 * DPR) {
                this.setSelected(closest_eater_idx);
            } else {
                this.selected_idx = -1;
            }
        });

        this.spawnFood();
    }

    private spawnFood(): void {

        this.food = [];

        for (let i = 0; i < this.params.food_count; i++) {
            this.food.push(this.randomPos());
        }
    }

    private randomPos(): Vector2D {
        return Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
    }

    private getClosestFood(eater: Eater): { index: number, dist: number } {

        let closest_idx = 0, closest_dist_sq = Infinity;

        for (let i = 0; i < this.food.length; i++) {
            const dist = eater.position.dist_sq(this.food[i]);
            if (dist < closest_dist_sq) {
                closest_dist_sq = dist;
                closest_idx = i;
            }
        }

        return {
            index: closest_idx,
            dist: closest_dist_sq ** 0.5
        }
    }

    private tick(): void {

        if (this.paused) return;

        if (++this.ticks > this.params.ticks_per_gen) {
            this.nextGeneration();
            this.ticks = 0;
        }

        //Update positions
        for (const eater of this.population) {

            const chromo = this.genetics.getPopulation()[eater.getChromosomeIdx()];
            this.brain.putWeights(this.layer_sizes, chromo.getBits());

            const closest_food = this.getClosestFood(eater);
            eater.closest_food = Vector2D.clone(this.food[closest_food.index]);

            //food dir
            const [food_l, food_r] = this.food[closest_food.index].sub(eater.position).normalize().toArray();

            if (closest_food.dist < (this.params.eater_size + this.params.food_size) / 2) { //snack time!
                const f = chromo.getFitness() || 1;
                chromo.setFitness(2 * f);
                this.food[closest_food.index] = this.randomPos();
            }

            //lookat

            const lookat = [
                Math.cos(eater.angle),
                Math.sin(eater.angle)
            ];

            const [turn_left, turn_right] = this.brain.run(...lookat, food_l, food_r);

            const rot_force = MathUtils.clamp(
                turn_left - turn_right,
                -this.params.max_turn_rate,
                this.params.max_turn_rate
            );

            eater.angle += rot_force;

            eater.lookat = new Vector2D(lookat[0], lookat[1]);
            eater.food_dir = new Vector2D(food_l, food_r);

            eater.position.plus(eater.lookat.times(this.params.max_speed * DPR));

            const pos = eater.position;

            if (this.params.wrap_borders) {
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

    public pause(): void {
        this.paused = !this.paused;
    }

    private nextGeneration(): void {

        if (this.stop_mating) return;

        this.genetics.mate();

        // reset fitness
        for (const eater of this.genetics.getPopulation()) {
            eater.setFitness(0);
        }

        this.spawnFood();

        for (let eater of this.population) {
            eater.position = this.randomPos();
        }

        this.selected_idx = -1;
    }

    public run() {

        let update = () => {
            this.tick();
            this.render();

            if (!this.fast_mode)
                requestAnimationFrame(update);
            else setTimeout(update, 0);
        };

        update();

    }

    private render(): void {

        if (this.fast_mode && this.ticks % this.fast_mode_refresh_rate !== 0) return;

        this.genetics.updateStats();

        this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);

        this.drawFood();
        this.drawEaters();
        this.highlightSelectedEater();
        this.drawGenerationInfo();
    }

    private drawGenerationInfo(): void {
        const best = this.genetics.getFittest().getFitness() !== 0 ?
            Math.log2(this.genetics.getFittest().getFitness()) : 0;

        this.ctx.fillStyle = 'black';
        this.ctx.fillText(`Generation: ${this.genetics.getGeneration()}`, 5, 10);
        this.ctx.fillText(`avg: ${Math.log2(1 + this.genetics.getAverageFitness()).toFixed(3)}`, 5, 25);
        this.ctx.fillText(`best: ${best}`, 5, 40);
        this.ctx.fillText(`ticks: ${this.ticks} / ${this.params.ticks_per_gen}`, 5, 55);
    }

    private highlightSelectedEater(): void {
        if (this.follow_fittest) {
            this.selected_idx = this.genetics.getStats().fittest_idx;
        }

        if (this.selected_idx !== -1 && !this.hide_non_selected) {
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'red';
            this.ctx.beginPath();
            const eater = this.population[this.selected_idx];
            const pos = eater.position;
            this.ctx.arc(pos.x / DPR, pos.y / DPR, this.params.eater_size * 2, 0, MathUtils.TWO_PI);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'black';
            this.ctx.moveTo(pos.x / DPR, pos.y / DPR);
            const food_dir = pos.add(eater.food_dir.times(this.params.eater_size * 2 * DPR));
            this.ctx.lineTo(food_dir.x / DPR, food_dir.y / DPR);
            this.ctx.stroke();
        }
    }

    private drawEaters(): void {

        const c1 = [46, 204, 113];
        const c2 = [255, 0, 0];
        const max = Math.log2(this.genetics.getFittest().getFitness());
        let i = 0;

        for (const eater of this.population) {

            if (this.show_lines) {
                this.ctx.beginPath();
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'black';
                this.ctx.moveTo(eater.position.x / DPR, eater.position.y / DPR);
                const food = eater.position.add(eater.food_dir.times(eater.position.dist(eater.closest_food)));
                this.ctx.lineTo(food.x / DPR, food.y / DPR);
                this.ctx.stroke();
            }

            if (this.hide_non_selected && this.selected_idx !== undefined && i++ !== this.selected_idx) continue;

            const fitness = Math.log2(this.genetics.getPopulation()[eater.getChromosomeIdx()].getFitness());

            const c = [
                MathUtils.clamp(MathUtils.map(fitness, 0, max, c1[0], c2[0]), Math.min(c1[0], c2[0]), Math.max(c1[0], c2[0])),
                MathUtils.clamp(MathUtils.map(fitness, 0, max, c1[1], c2[1]), Math.min(c1[1], c2[1]), Math.max(c1[1], c2[1])),
                MathUtils.clamp(MathUtils.map(fitness, 0, max, c1[2], c2[2]), Math.min(c1[2], c2[2]), Math.max(c1[2], c2[2]))
            ];

            this.ctx.lineWidth = 4;
            this.ctx.fillStyle = `rgb(
                ${Math.floor(c[0])},
                ${Math.floor(c[1])},
                ${Math.floor(c[1])}
            )`;

            this.ctx.beginPath();
            let la = eater.lookat.times(this.params.eater_size * DPR).add(eater.position);
            let a = la.sub(eater.position).angle();
            let b = Math.PI / 1.3;
            let u = new Vector2D(Math.cos(a + b), Math.sin(a + b));
            let v = new Vector2D(Math.cos(a - b), Math.sin(a - b));
            let p1 = eater.position.add(u.times(this.params.eater_size * DPR));
            let p2 = eater.position.add(v.times(this.params.eater_size * DPR));
            this.ctx.moveTo(p1.x / DPR, p1.y / DPR);
            this.ctx.lineTo(la.x / DPR, la.y / DPR);
            this.ctx.lineTo(p2.x / DPR, p2.y / DPR);
            this.ctx.fill();

        }
    }

    private drawFood(): void {
        //draw food
        this.ctx.fillStyle = 'rgb(52, 73, 94)';
        const fs = this.params.food_size;
        for (let f of this.food) {
            this.ctx.beginPath();
            this.ctx.fillRect((f.x - fs / 2) / DPR, (f.y - fs / 2) / DPR, fs, fs);
            this.ctx.fill();
        }
    }

    public setSelected(index: number): void {
        this.follow_fittest = false;
        this.selected_idx = index;
    }

    public getSelected(): Eater {
        return this.population[this.selected_idx];
    }

    public getEater(idx: number): Eater {
        return this.population[idx];
    }

    public getEaterBrain(idx: number) {
        return NeuralNet.fromWeights(this.layer_sizes, this.genetics.getChromosome(this.population[idx].getChromosomeIdx()).getBits()).toFunction();
    }

    public toggleFastMode(): void {
        this.fast_mode = !this.fast_mode;
    }

    public getDarwinInstance(): Darwin<number> {
        return this.genetics;
    }

    public getFittestBrain(): NeuralNetFunction {
        return NeuralNet.fromWeights(this.layer_sizes, this.genetics.getFittest().getBits()).toFunction();
    }

    public toggleMating(): void {
        this.stop_mating = !this.stop_mating;
    }

    public get selectedIdx(): number {
        return this.selected_idx;
    }

    public get parameters(): Readonly<EatersParams> {
        return this.params;
    }

}