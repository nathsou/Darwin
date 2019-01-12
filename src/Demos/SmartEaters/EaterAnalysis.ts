import { MathUtils } from "./MathUtils";
import { EatersParams } from "./SmartEaters";
import { Vector2D } from "./Vector2D";
import { NeuralNetFunction } from "./NeuralNet";
import { Eater } from "./Eater";

// Study a single Eater at a time
export class EaterAnalysis {

    private cnv: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private food_pos: Vector2D;
    private eater: Eater;
    private params: EatersParams;
    private brain: Function;

    private paused = true;

    constructor(params: EatersParams, brain: NeuralNetFunction) {

        this.params = params;
        this.brain = new Function(...brain.args, brain.body);

        this.cnv = document.createElement('canvas');
        this.cnv.width = window.innerWidth;
        this.cnv.height = window.innerHeight;
        this.ctx = this.cnv.getContext('2d');

        this.food_pos = Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);

        window.addEventListener('resize', () => this.on_resize());

        this.eater = new Eater(Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]), Math.random() * Math.PI * 2, 0);

    }

    private on_resize(): void {
        this.cnv.width = window.innerWidth;
        this.cnv.height = window.innerHeight;

        if (this.cnv.width < this.food_pos.x || this.cnv.height < this.food_pos.y) {
            this.food_pos = Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }
    }

    public update(): void {
        this.tick();
        this.render();

        if (!this.paused) {
            requestAnimationFrame(() => this.update());
        }
    }

    public pause(): void {
        this.paused = true;
    }

    public start(): void {
        this.paused = false;
        this.update();
    }

    private tick(): void {
        if (this.eater.position.dist(this.food_pos) <= (this.params.eater_size + this.params.food_size) / 2) {
            this.food_pos = Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }

        this.eater.food_dir = this.food_pos.sub(this.eater.position.normalize());

        const [turn_left, turn_right] = this.brain([
            Math.cos(this.eater.angle),
            Math.sin(this.eater.angle),
            this.eater.food_dir.x,
            this.eater.food_dir.y
        ]);

        const rot_force = MathUtils.clamp(
            turn_left - turn_right,
            -this.params.max_turn_rate,
            this.params.max_turn_rate
        );

        this.eater.angle += rot_force;

        this.eater.lookat = new Vector2D(Math.cos(this.eater.angle), Math.sin(this.eater.angle));

        this.eater.position.plus(this.eater.lookat.times(this.params.max_speed));

        if (this.params.wrap_borders) {
            if (this.eater.position.x > this.cnv.width) this.eater.position.x = 0;
            if (this.eater.position.x < 0) this.eater.position.x = this.cnv.width;
            if (this.eater.position.y > this.cnv.height) this.eater.position.y = 0;
            if (this.eater.position.y < 0) this.eater.position.y = this.cnv.height;
        } else {
            if (this.eater.position.x > this.cnv.width) this.eater.position.x = this.cnv.width;
            if (this.eater.position.x < 0) this.eater.position.x = 0;
            if (this.eater.position.y > this.cnv.height) this.eater.position.y = this.cnv.height;
            if (this.eater.position.y < 0) this.eater.position.y = 0;
        }
    }

    private render(): void {
        this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
        this.drawFood();
        this.drawEeater();
    }

    private drawFood(): void {
        const fs = this.params.food_size;
        this.ctx.fillStyle = 'rgb(52, 73, 94)';
        this.ctx.beginPath();
        this.ctx.fillRect(this.food_pos.x - fs / 2, this.food_pos.y - fs / 2, fs, fs);
        this.ctx.fill();
    }

    private drawEeater(): void {
        //d raw eater
        this.ctx.fillStyle = 'rgb(22, 160, 133)';

        this.ctx.beginPath();
        const la = this.eater.lookat.times(this.params.eater_size).add(this.eater.position);
        const a = la.sub(this.eater.position).angle();
        const b = Math.PI / 1.3;
        const u = new Vector2D(Math.cos(a + b), Math.sin(a + b));
        const v = new Vector2D(Math.cos(a - b), Math.sin(a - b));
        const p1 = this.eater.position.add(u.times(this.params.eater_size));
        const p2 = this.eater.position.add(v.times(this.params.eater_size));
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(la.x, la.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.fill();

        this.ctx.strokeStyle = 'black';
        this.ctx.moveTo(this.eater.position.x, this.eater.position.y);
        const fd = this.eater.position.add(this.eater.food_dir.times(this.params.eater_size * 2));
        this.ctx.lineTo(fd.x, fd.y);
        this.ctx.stroke();
    }

    public get domElement(): HTMLCanvasElement {
        return this.cnv;
    }

    public static fromBlob(blob: Blob | string): Promise<EaterAnalysis> {

        return new Promise<EaterAnalysis>(async (resolve, reject) => {
            try {
                const data = JSON.parse(await (await fetch(blob.toString())).text()) as {
                    params: EatersParams,
                    brain: NeuralNetFunction
                };
                console.log(data);
                resolve(new EaterAnalysis(data.params, data.brain));
            } catch (err) {
                reject(err);
            }
        });
    };

}