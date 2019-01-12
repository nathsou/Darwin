"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CrossoverMethods_1 = require("../../CrossoverMethods");
const Darwin_1 = require("../../Darwin");
const Eater_1 = require("./Eater");
const NeuralNet_1 = require("./NeuralNet");
const Vector2D_1 = require("./Vector2D");
const MathUtils_1 = require("./MathUtils");
exports.DPR = window.devicePixelRatio;
class SmartEaters {
    constructor(cnv, params) {
        this.ticks = 0;
        this.follow_fittest = false;
        this.paused = false;
        this.fast_mode = false;
        this.fast_mode_refresh_rate = 2;
        this.show_lines = false;
        this.hide_non_selected = false;
        this.stop_mating = false;
        this.cnv = cnv;
        this.ctx = this.cnv.getContext('2d');
        let choose = (a, b) => {
            if (a === null || a === undefined)
                return b;
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
        this.params.crossover_method = choose(this.params.crossover_method, CrossoverMethods_1.CrossoverMethod.SINGLE_POINT);
        this.params.eater_size = this.params.eater_size || 12;
        this.params.food_size = this.params.food_size || 5;
        this.params.wrap_borders = choose(this.params.wrap_borders, true);
        this.layer_sizes = [4, ...this.params.hidden_layers_sizes, 2];
        this.brain = new NeuralNet_1.NeuralNet();
        this.genetics = new Darwin_1.Darwin({
            population_size: this.params.population_size,
            rand_func: () => (Math.random() * 2) - 1,
            chromosome_length: NeuralNet_1.NeuralNet.weightsCount(this.layer_sizes)
        });
        //Associate each chromosome to a Eater
        this.population = this.genetics.getPopulation().map((_, idx) => new Eater_1.Eater(this.randomPos(), Math.random() * MathUtils_1.MathUtils.TWO_PI, idx));
        this.cnv.addEventListener('click', (e) => {
            const mouse_pos = new Vector2D_1.Vector2D(e.clientX * exports.DPR, e.clientY * exports.DPR);
            let closest_eater_idx = 0, closest_eater_dist = Infinity;
            for (let i = 0; i < this.population.length; i++) {
                const dist_sq = this.population[i].getPosition().dist_sq(mouse_pos);
                if (dist_sq < closest_eater_dist) {
                    closest_eater_dist = dist_sq;
                    closest_eater_idx = i;
                }
            }
            if (Math.pow(closest_eater_dist, 0.5) < this.params.eater_size * 2 * exports.DPR) {
                this.setSelected(closest_eater_idx);
            }
            else {
                this.selected_idx = undefined;
            }
        });
        this.spawnFood();
    }
    spawnFood() {
        this.food = [];
        for (let i = 0; i < this.params.food_count; i++) {
            this.food.push(this.randomPos());
        }
    }
    randomPos() {
        return Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
    }
    getClosestFood(eater) {
        let closest_idx = 0, closest_dist_sq = Infinity;
        for (let i = 0; i < this.food.length; i++) {
            const dist = eater.getPosition().dist_sq(this.food[i]);
            if (dist < closest_dist_sq) {
                closest_dist_sq = dist;
                closest_idx = i;
            }
        }
        return {
            index: closest_idx,
            dist: Math.pow(closest_dist_sq, 0.5)
        };
    }
    tick() {
        if (this.paused)
            return;
        if (++this.ticks > this.params.ticks_per_gen) {
            this.nextGeneration();
            this.ticks = 0;
        }
        //Update positions
        for (let eater of this.population) {
            const chromo = this.genetics.getPopulation()[eater.getChromosomeIdx()];
            this.brain.putWeights(this.layer_sizes, chromo.getBits());
            const closest_food = this.getClosestFood(eater);
            eater.closest_food = Vector2D_1.Vector2D.clone(this.food[closest_food.index]);
            //food dir
            const [food_l, food_r] = this.food[closest_food.index].sub(eater.getPosition()).normalize().toArray();
            if (closest_food.dist < (this.params.eater_size + this.params.food_size) / 2) { //snack time!
                const f = chromo.getFitness() || 1;
                chromo.setFitness(2 * f);
                this.food[closest_food.index] = this.randomPos();
            }
            //lookat
            const lookat = [
                Math.cos(eater.getAngle()),
                Math.sin(eater.getAngle())
            ];
            const [turn_left, turn_right] = this.brain.run(...lookat, food_l, food_r);
            const rot_force = MathUtils_1.MathUtils.clamp(turn_left - turn_right, -this.params.max_turn_rate, this.params.max_turn_rate);
            eater.setAngle(eater.getAngle() + rot_force);
            eater.lookat = new Vector2D_1.Vector2D(lookat[0], lookat[1]);
            eater.food_dir = new Vector2D_1.Vector2D(food_l, food_r);
            eater.getPosition().plus(eater.lookat.times(this.params.max_speed * exports.DPR));
            let pos = eater.getPosition();
            if (this.params.wrap_borders) {
                if (pos.x > this.cnv.width)
                    pos.x = 0;
                if (pos.x < 0)
                    pos.x = this.cnv.width;
                if (pos.y > this.cnv.height)
                    pos.y = 0;
                if (pos.y < 0)
                    pos.y = this.cnv.height;
            }
            else {
                if (pos.x > this.cnv.width)
                    pos.x = this.cnv.width;
                if (pos.x < 0)
                    pos.x = 0;
                if (pos.y > this.cnv.height)
                    pos.y = this.cnv.height;
                if (pos.y < 0)
                    pos.y = 0;
            }
        }
    }
    pause() {
        this.paused = !this.paused;
    }
    nextGeneration() {
        if (this.stop_mating)
            return;
        this.genetics.mate();
        // reset fitness
        for (const eater of this.genetics.getPopulation()) {
            eater.setFitness(0);
        }
        this.spawnFood();
        for (let eater of this.population) {
            eater.setPosition(this.randomPos());
        }
        this.selected_idx = undefined;
    }
    run() {
        let update = () => {
            this.tick();
            this.render();
            if (!this.fast_mode)
                requestAnimationFrame(update);
            else
                setTimeout(update, 0);
        };
        update();
    }
    render() {
        if (this.fast_mode && this.ticks % this.fast_mode_refresh_rate !== 0)
            return;
        this.genetics.updateStats();
        this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
        //draw food
        this.ctx.fillStyle = 'rgb(52, 73, 94)';
        const fs = this.params.food_size;
        for (let f of this.food) {
            this.ctx.beginPath();
            this.ctx.fillRect((f.x - fs / 2) / exports.DPR, (f.y - fs / 2) / exports.DPR, fs, fs);
            this.ctx.fill();
        }
        // draw Eaters
        const c1 = [46, 204, 113];
        const c2 = [255, 0, 0];
        const max = Math.log2(this.genetics.getFittest().getFitness());
        let i = 0;
        for (let eater of this.population) {
            if (this.show_lines) {
                this.ctx.beginPath();
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'black';
                this.ctx.moveTo(eater.getPosition().x / exports.DPR, eater.getPosition().y / exports.DPR);
                const food = eater.getPosition().add(eater.food_dir.times(eater.getPosition().dist(eater.closest_food)));
                this.ctx.lineTo(food.x / exports.DPR, food.y / exports.DPR);
                this.ctx.stroke();
            }
            if (this.hide_non_selected && this.selected_idx && i++ !== this.selected_idx)
                continue;
            const fitness = Math.log2(this.genetics.getPopulation()[eater.getChromosomeIdx()].getFitness());
            let c = [
                MathUtils_1.MathUtils.clamp(MathUtils_1.MathUtils.map(fitness, 0, max, c1[0], c2[0]), Math.min(c1[0], c2[0]), Math.max(c1[0], c2[0])),
                MathUtils_1.MathUtils.clamp(MathUtils_1.MathUtils.map(fitness, 0, max, c1[1], c2[1]), Math.min(c1[1], c2[1]), Math.max(c1[1], c2[1])),
                MathUtils_1.MathUtils.clamp(MathUtils_1.MathUtils.map(fitness, 0, max, c1[2], c2[2]), Math.min(c1[2], c2[2]), Math.max(c1[2], c2[2]))
            ];
            this.ctx.lineWidth = 4;
            this.ctx.fillStyle = `rgb(
                ${Math.floor(c[0])},
                ${Math.floor(c[1])},
                ${Math.floor(c[1])}
            )`;
            this.ctx.beginPath();
            let la = eater.lookat.times(this.params.eater_size * exports.DPR).add(eater.getPosition());
            let a = la.sub(eater.getPosition()).angle();
            let b = Math.PI / 1.3;
            let u = new Vector2D_1.Vector2D(Math.cos(a + b), Math.sin(a + b));
            let v = new Vector2D_1.Vector2D(Math.cos(a - b), Math.sin(a - b));
            let p1 = eater.getPosition().add(u.times(this.params.eater_size * exports.DPR));
            let p2 = eater.getPosition().add(v.times(this.params.eater_size * exports.DPR));
            this.ctx.moveTo(p1.x / exports.DPR, p1.y / exports.DPR);
            this.ctx.lineTo(la.x / exports.DPR, la.y / exports.DPR);
            this.ctx.lineTo(p2.x / exports.DPR, p2.y / exports.DPR);
            this.ctx.fill();
        }
        //highlight the selected eater:
        if (this.follow_fittest) {
            const max_fitness = this.genetics.getFittest().getFitness();
            this.selected_idx = this.genetics.getPopulation().findIndex(e => e.getFitness() === max_fitness);
            // .indexOf(this.genetics.getFittest());
        }
        if (this.selected_idx && !this.hide_non_selected) {
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'red';
            this.ctx.beginPath();
            const eater = this.population[this.selected_idx];
            const pos = eater.getPosition();
            this.ctx.arc(pos.x / exports.DPR, pos.y / exports.DPR, this.params.eater_size * 2, 0, MathUtils_1.MathUtils.TWO_PI);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'black';
            this.ctx.moveTo(pos.x / exports.DPR, pos.y / exports.DPR);
            const food_dir = pos.add(eater.food_dir.times(this.params.eater_size * 2 * exports.DPR));
            this.ctx.lineTo(food_dir.x / exports.DPR, food_dir.y / exports.DPR);
            this.ctx.stroke();
        }
        const best = this.genetics.getFittest().getFitness() !== 0 ?
            Math.log2(this.genetics.getFittest().getFitness()) : 0;
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(`Generation: ${this.genetics.getGeneration()}`, 5, 10);
        this.ctx.fillText(`avg: ${Math.log2(1 + this.genetics.getAverageFitness()).toFixed(3)}`, 5, 25);
        this.ctx.fillText(`best: ${best}`, 5, 40);
        this.ctx.fillText(`ticks: ${this.ticks} / ${this.params.ticks_per_gen}`, 5, 55);
    }
    setSelected(index) {
        this.follow_fittest = false;
        this.selected_idx = index;
    }
    getSelected() {
        return this.population[this.selected_idx];
    }
    getEater(idx) {
        return this.population[idx];
    }
    getEaterBrain(idx) {
        return NeuralNet_1.NeuralNet.fromWeights(this.layer_sizes, this.genetics.getChromosome(this.population[idx].getChromosomeIdx()).getBits()).toFunction();
    }
    toggleFastMode() {
        this.fast_mode = !this.fast_mode;
    }
    getDarwinInstance() {
        return this.genetics;
    }
    getFittestBrain() {
        return NeuralNet_1.NeuralNet.fromWeights(this.layer_sizes, this.genetics.getFittest().getBits()).toFunction();
    }
    toggleMating() {
        this.stop_mating = !this.stop_mating;
    }
    get selectedIdx() {
        return this.selected_idx;
    }
    get parameters() {
        return this.params;
    }
}
exports.SmartEaters = SmartEaters;
