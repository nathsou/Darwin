"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EaterAnalysis = void 0;
const MathUtils_1 = require("./MathUtils");
const Vector2D_1 = require("./Vector2D");
const Eater_1 = require("./Eater");
// Study a single Eater at a time
class EaterAnalysis {
    constructor(params, brain) {
        this.paused = true;
        this.params = params;
        // this is evil
        this.brain = new Function(...brain.args, brain.body);
        this.cnv = document.createElement('canvas');
        this.cnv.width = window.innerWidth;
        this.cnv.height = window.innerHeight;
        const ctx = this.cnv.getContext('2d');
        if (ctx === null) {
            throw new Error(`Could not get a 2d canvas context`);
        }
        this.foodPos = Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        window.addEventListener('resize', () => this.onResize());
        this.eater = new Eater_1.Eater(Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]), Math.random() * Math.PI * 2, 0);
    }
    onResize() {
        this.cnv.width = window.innerWidth;
        this.cnv.height = window.innerHeight;
        if (this.cnv.width < this.foodPos.x || this.cnv.height < this.foodPos.y) {
            this.foodPos = Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }
    }
    update() {
        this.tick();
        this.render();
        if (!this.paused) {
            requestAnimationFrame(this.update);
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
        if (this.eater.getPosition().dist(this.foodPos) <= (this.params.eaterSize + this.params.foodSize) / 2) {
            this.foodPos = Vector2D_1.Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }
        this.eater.foodDir = this.foodPos.sub(this.eater.getPosition().normalize());
        const [turnLeft, turnRight] = this.brain([
            Math.cos(this.eater.getAngle()),
            Math.sin(this.eater.getAngle()),
            this.eater.foodDir.x,
            this.eater.foodDir.y
        ]);
        const rotationForce = MathUtils_1.MathUtils.clamp(turnLeft - turnRight, -this.params.maxTurnRate, this.params.maxTurnRate);
        this.eater.setAngle(this.eater.getAngle() + rotationForce);
        this.eater.lookat = new Vector2D_1.Vector2D(Math.cos(this.eater.getAngle()), Math.sin(this.eater.getAngle()));
        this.eater.getPosition().plus(this.eater.lookat.times(this.params.maxSpeed));
        if (this.params.wrapBorders) {
            if (this.eater.getPosition().x > this.cnv.width)
                this.eater.getPosition().x = 0;
            if (this.eater.getPosition().x < 0)
                this.eater.getPosition().x = this.cnv.width;
            if (this.eater.getPosition().y > this.cnv.height)
                this.eater.getPosition().y = 0;
            if (this.eater.getPosition().y < 0)
                this.eater.getPosition().y = this.cnv.height;
        }
        else {
            if (this.eater.getPosition().x > this.cnv.width)
                this.eater.getPosition().x = this.cnv.width;
            if (this.eater.getPosition().x < 0)
                this.eater.getPosition().x = 0;
            if (this.eater.getPosition().y > this.cnv.height)
                this.eater.getPosition().y = this.cnv.height;
            if (this.eater.getPosition().y < 0)
                this.eater.getPosition().y = 0;
        }
    }
    render() {
        this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
        this.drawFood();
        this.drawEeater();
    }
    drawFood() {
        const fs = this.params.foodSize;
        this.ctx.fillStyle = 'rgb(52, 73, 94)';
        this.ctx.beginPath();
        this.ctx.fillRect(this.foodPos.x - fs / 2, this.foodPos.y - fs / 2, fs, fs);
        this.ctx.fill();
    }
    drawEeater() {
        //d raw eater
        this.ctx.fillStyle = 'rgb(22, 160, 133)';
        this.ctx.beginPath();
        const la = this.eater.lookat.times(this.params.eaterSize).add(this.eater.getPosition());
        const a = la.sub(this.eater.getPosition()).angle();
        const b = Math.PI / 1.3;
        const u = new Vector2D_1.Vector2D(Math.cos(a + b), Math.sin(a + b));
        const v = new Vector2D_1.Vector2D(Math.cos(a - b), Math.sin(a - b));
        const p1 = this.eater.getPosition().add(u.times(this.params.eaterSize));
        const p2 = this.eater.getPosition().add(v.times(this.params.eaterSize));
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(la.x, la.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.fill();
        this.ctx.strokeStyle = 'black';
        this.ctx.moveTo(this.eater.getPosition().x, this.eater.getPosition().y);
        const fd = this.eater.getPosition().add(this.eater.foodDir.times(this.params.eaterSize * 2));
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
