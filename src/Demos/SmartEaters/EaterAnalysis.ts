import { MathUtils } from "./MathUtils";
import { EatersParams } from "./SmartEaters";
import { Vector2D } from "./Vector2D";
import { NeuralNetFunction } from "./NeuralNet";
import { Eater } from "./Eater";

// Study a single Eater at a time
export class EaterAnalysis {
    private cnv: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private foodPos: Vector2D;
    private eater: Eater;
    private params: Required<EatersParams>;
    private brain: Function;
    private paused = true;

    constructor(params: Required<EatersParams>, brain: NeuralNetFunction) {
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

        this.foodPos = Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        window.addEventListener('resize', () => this.onResize());
        this.eater = new Eater(Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]), Math.random() * Math.PI * 2, 0);
    }

    private onResize(): void {
        this.cnv.width = window.innerWidth;
        this.cnv.height = window.innerHeight;

        if (this.cnv.width < this.foodPos.x || this.cnv.height < this.foodPos.y) {
            this.foodPos = Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }
    }

    public update(): void {
        this.tick();
        this.render();

        if (!this.paused) {
            requestAnimationFrame(this.update);
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
        if (this.eater.getPosition().dist(this.foodPos) <= (this.params.eaterSize + this.params.foodSize) / 2) {
            this.foodPos = Vector2D.rand().hadamard([this.cnv.width, this.cnv.height]);
        }

        this.eater.foodDir = this.foodPos.sub(this.eater.getPosition().normalize());

        const [turnLeft, turnRight] = this.brain([
            Math.cos(this.eater.getAngle()),
            Math.sin(this.eater.getAngle()),
            this.eater.foodDir.x,
            this.eater.foodDir.y
        ]);

        const rotationForce = MathUtils.clamp(
            turnLeft - turnRight,
            -this.params.maxTurnRate,
            this.params.maxTurnRate
        );

        this.eater.setAngle(this.eater.getAngle() + rotationForce);

        this.eater.lookat = new Vector2D(Math.cos(this.eater.getAngle()), Math.sin(this.eater.getAngle()));

        this.eater.getPosition().plus(this.eater.lookat.times(this.params.maxSpeed));

        if (this.params.wrapBorders) {
            if (this.eater.getPosition().x > this.cnv.width) this.eater.getPosition().x = 0;
            if (this.eater.getPosition().x < 0) this.eater.getPosition().x = this.cnv.width;
            if (this.eater.getPosition().y > this.cnv.height) this.eater.getPosition().y = 0;
            if (this.eater.getPosition().y < 0) this.eater.getPosition().y = this.cnv.height;
        } else {
            if (this.eater.getPosition().x > this.cnv.width) this.eater.getPosition().x = this.cnv.width;
            if (this.eater.getPosition().x < 0) this.eater.getPosition().x = 0;
            if (this.eater.getPosition().y > this.cnv.height) this.eater.getPosition().y = this.cnv.height;
            if (this.eater.getPosition().y < 0) this.eater.getPosition().y = 0;
        }
    }

    private render(): void {
        this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
        this.drawFood();
        this.drawEeater();
    }

    private drawFood(): void {
        const fs = this.params.foodSize;
        this.ctx.fillStyle = 'rgb(52, 73, 94)';
        this.ctx.beginPath();
        this.ctx.fillRect(this.foodPos.x - fs / 2, this.foodPos.y - fs / 2, fs, fs);
        this.ctx.fill();
    }

    private drawEeater(): void {
        //d raw eater
        this.ctx.fillStyle = 'rgb(22, 160, 133)';

        this.ctx.beginPath();
        const la = this.eater.lookat.times(this.params.eaterSize).add(this.eater.getPosition());
        const a = la.sub(this.eater.getPosition()).angle();
        const b = Math.PI / 1.3;
        const u = new Vector2D(Math.cos(a + b), Math.sin(a + b));
        const v = new Vector2D(Math.cos(a - b), Math.sin(a - b));
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

    public get domElement(): HTMLCanvasElement {
        return this.cnv;
    }

    public static fromBlob(blob: Blob | string): Promise<EaterAnalysis> {
        return new Promise<EaterAnalysis>(async (resolve, reject) => {
            try {
                const data = JSON.parse(await (await fetch(blob.toString())).text()) as {
                    params: Required<EatersParams>,
                    brain: NeuralNetFunction
                };

                resolve(new EaterAnalysis(data.params, data.brain));
            } catch (err) {
                reject(err);
            }
        });
    };
}