import { MathUtils } from "./MathUtils";
import { EatersParams } from "./SmartEaters";
import { Vector2D } from "./Vector2D";
import { NeuralNetFunction } from "./NeuralNet";

// Study a single Eater at a time
export class EaterAnalysis {

    private cnv: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private eater_pos: Vector2D;
    private food_pos: Vector2D;
    private food_dir: Vector2D;
    private lookat: Vector2D;
    private eater_angle: number;
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

        this.eater_pos = Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        this.eater_angle = Math.random() * Math.PI * 2;

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
        if (this.eater_pos.dist(this.food_pos) <= (this.params.eater_size + this.params.food_size) / 2) {
            this.food_pos = Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }

        this.food_dir = this.food_pos.sub(this.eater_pos).normalize();

        const [turn_left, turn_right] = this.brain([
            Math.cos(this.eater_angle),
            Math.sin(this.eater_angle),
            this.food_dir.x,
            this.food_dir.y
        ]);

        const rot_force = MathUtils.clamp(
            turn_left - turn_right,
            -this.params.max_turn_rate,
            this.params.max_turn_rate
        );

        this.eater_angle += rot_force;

        this.lookat = new Vector2D(Math.cos(this.eater_angle), Math.sin(this.eater_angle));

        this.eater_pos.plus(this.lookat.times(this.params.max_speed));

        if (this.params.wrap_borders) {
            if (this.eater_pos.x > this.cnv.width) this.eater_pos.x = 0;
            if (this.eater_pos.x < 0) this.eater_pos.x = this.cnv.width;
            if (this.eater_pos.y > this.cnv.height) this.eater_pos.y = 0;
            if (this.eater_pos.y < 0) this.eater_pos.y = this.cnv.height;
        } else {
            if (this.eater_pos.x > this.cnv.width) this.eater_pos.x = this.cnv.width;
            if (this.eater_pos.x < 0) this.eater_pos.x = 0;
            if (this.eater_pos.y > this.cnv.height) this.eater_pos.y = this.cnv.height;
            if (this.eater_pos.y < 0) this.eater_pos.y = 0;
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
        const la = this.lookat.times(this.params.eater_size).add(this.eater_pos);
        const a = la.sub(this.eater_pos).angle();
        const b = Math.PI / 1.3;
        const u = new Vector2D(Math.cos(a + b), Math.sin(a + b));
        const v = new Vector2D(Math.cos(a - b), Math.sin(a - b));
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