"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const MathUtils_1 = require("./MathUtils");
const Vector2D_1 = require("./Vector2D");
// Study a single Eater at a time
class EaterAnalysis {
    constructor(params, brain) {
        this.paused = true;
        this.params = params;
        this.brain = new Function(...brain.args, brain.body);
        this.cnv = document.createElement('canvas');
        this.cnv.width = window.innerWidth;
        this.cnv.height = window.innerHeight;
        this.ctx = this.cnv.getContext('2d');
        this.food_pos = Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        window.addEventListener('resize', () => this.on_resize());
        this.eater_pos = Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        this.eater_angle = Math.random() * Math.PI * 2;
    }
    on_resize() {
        this.cnv.width = window.innerWidth;
        this.cnv.height = window.innerHeight;
        if (this.cnv.width < this.food_pos.x || this.cnv.height < this.food_pos.y) {
            this.food_pos = Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }
    }
    update() {
        this.tick();
        this.render();
        if (!this.paused) {
            requestAnimationFrame(() => this.update());
        }
    }
    pause() {
        this.paused = true;
    }
    start() {
        this.paused = false;
        this.update();
    }
    tick() {
        if (this.eater_pos.dist(this.food_pos) <= (this.params.eater_size + this.params.food_size) / 2) {
            this.food_pos = Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }
        this.food_dir = this.food_pos.sub(this.eater_pos).normalize();
        const [turn_left, turn_right] = this.brain([
            Math.cos(this.eater_angle),
            Math.sin(this.eater_angle),
            this.food_dir.x,
            this.food_dir.y
        ]);
        const rot_force = MathUtils_1.MathUtils.clamp(turn_left - turn_right, -this.params.max_turn_rate, this.params.max_turn_rate);
        this.eater_angle += rot_force;
        this.lookat = new Vector2D_1.Vector2D(Math.cos(this.eater_angle), Math.sin(this.eater_angle));
        this.eater_pos.plus(this.lookat.times(this.params.max_speed));
        if (this.params.wrap_borders) {
            if (this.eater_pos.x > this.cnv.width)
                this.eater_pos.x = 0;
            if (this.eater_pos.x < 0)
                this.eater_pos.x = this.cnv.width;
            if (this.eater_pos.y > this.cnv.height)
                this.eater_pos.y = 0;
            if (this.eater_pos.y < 0)
                this.eater_pos.y = this.cnv.height;
        }
        else {
            if (this.eater_pos.x > this.cnv.width)
                this.eater_pos.x = this.cnv.width;
            if (this.eater_pos.x < 0)
                this.eater_pos.x = 0;
            if (this.eater_pos.y > this.cnv.height)
                this.eater_pos.y = this.cnv.height;
            if (this.eater_pos.y < 0)
                this.eater_pos.y = 0;
        }
    }
    render() {
        this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
        this.drawFood();
        this.drawEeater();
    }
    drawFood() {
        const fs = this.params.food_size;
        this.ctx.fillStyle = 'rgb(52, 73, 94)';
        this.ctx.beginPath();
        this.ctx.fillRect(this.food_pos.x - fs / 2, this.food_pos.y - fs / 2, fs, fs);
        this.ctx.fill();
    }
    drawEeater() {
        //d raw eater
        this.ctx.fillStyle = 'rgb(22, 160, 133)';
        this.ctx.beginPath();
        const la = this.lookat.times(this.params.eater_size).add(this.eater_pos);
        const a = la.sub(this.eater_pos).angle();
        const b = Math.PI / 1.3;
        const u = new Vector2D_1.Vector2D(Math.cos(a + b), Math.sin(a + b));
        const v = new Vector2D_1.Vector2D(Math.cos(a - b), Math.sin(a - b));
        const p1 = this.eater_pos.add(u.times(this.params.eater_size));
        const p2 = this.eater_pos.add(v.times(this.params.eater_size));
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(la.x, la.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.fill();
        this.ctx.strokeStyle = 'black';
        this.ctx.moveTo(this.eater_pos.x, this.eater_pos.y);
        const fd = this.eater_pos.add(this.food_dir.times(this.params.eater_size * 2));
        this.ctx.lineTo(fd.x, fd.y);
        this.ctx.stroke();
    }
    get domElement() {
        return this.cnv;
    }
    static fromBlob(blob) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = JSON.parse(yield (yield fetch(blob.toString())).text());
                console.log(data);
                resolve(new EaterAnalysis(data.params, data.brain));
            }
            catch (err) {
                reject(err);
            }
        }));
    }
    ;
}
exports.EaterAnalysis = EaterAnalysis;
