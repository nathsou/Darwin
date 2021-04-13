import { crossoverMethod } from '../../CrossoverMethods';
import { Darwin, DarwinParams } from "../../Darwin";
import { mutationMethod } from '../../MutationMethod';
import { randChar } from '../common/Text';
import { createCanvas } from '../common/Utils';

const maxPossibleFitness = 1000;

const evalFitness = (source: ImageData, target: ImageData): number => {
    let diffSum = 0;

    for (let i = 0; i < source.data.length; i += 4) {
        const diff = Math.abs(target.data[i + 3] - source.data[i + 3]);
        diffSum += (255 - diff) ** 2;
    }

    return 1000 ** (diffSum / (255 ** 2 * source.data.length / 4));
};

export const renderBlurredText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    font: CanvasTextDrawingStyles['font'],
    blurRadius: number
): void => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = font;
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.fillText(text, 2, 30);
};

interface DeblurrerParams {
    populationSize: number,
    target: string,
    font: string,
    blurRadius: number,
    onTick?: () => void
}

const measureText = (text: string, font: string) => {
    const [_, ctx] = createCanvas({ width: 1000, height: 100 });
    ctx.font = font;
    return ctx.measureText(text);
};

export class Deblurrer {
    private width: number;
    private height: number;
    private darwinParams: DarwinParams<string>;
    private params: DeblurrerParams;
    private population: Darwin<string>;
    private targetContext: CanvasRenderingContext2D;
    private targetImageData: ImageData;
    private contexts: CanvasRenderingContext2D[];
    private bestFitness = 0;
    private bestText = '';
    private memo = new Map<string, number>();
    private isRunning = false;

    constructor(params: DeblurrerParams) {
        this.targetContext = createCanvas({}, {
            border: '1px solid black'
        })[1];

        this.update(params);
    }

    public update(params: DeblurrerParams): void {
        this.isRunning = false;
        this.params = params;
        this.renderTarget();
        this.updateDarwinParams();
        this.generateContexts();
        this.population = new Darwin<string>(this.darwinParams);

        this.targetImageData = this.renderTarget();
    }

    private updateDarwinParams(): DarwinParams<string> {
        this.darwinParams = {
            populationSize: this.params.populationSize,
            randomGene: randChar,
            chromosomeLength: this.params.target.length,
            mutationMethod: mutationMethod.flip,
            crossoverMethod: crossoverMethod.uniform,
            mutationRate: 0.1,
            crossoverRate: 0.95
        };

        return this.darwinParams;
    }

    private renderTarget(): ImageData {
        const { width } = measureText(this.params.target, this.params.font);
        this.width = width + 5;
        this.height = 35;
        this.targetContext.canvas.width = this.width;
        this.targetContext.canvas.height = this.height;
        renderBlurredText(this.targetContext, this.params.target, this.params.font, this.params.blurRadius);
        return this.targetContext.getImageData(0, 0, this.width, this.height);
    }

    private generateContexts(): void {
        this.contexts = [];
        for (let i = 0; i < this.params.populationSize; i++) {
            this.contexts.push(createCanvas({
                width: this.width,
                height: this.height
            }, {
                border: '1px solid black'
            })[1]);
        }
    };

    public update = (params: DeblurrerParams): void => {
        this.params = params;
        this.targetImageData = this.renderTarget();
        this.population = new Darwin<string>(this.updateDarwinParams());
        this.bestFitness = 0;
        this.bestText = '';
        this.generateContexts();
    };

    public tick(): void {
        if (this.memo.size > 10000) {
            this.memo.clear();
        }

        this.population.updateFitness((chars, index) => {
            const ctx = this.contexts[index];
            const text = chars.join('');
            renderBlurredText(ctx, text, this.params.font, this.params.blurRadius);

            if (!this.memo.has(text)) {
                const fitness = evalFitness(
                    ctx.getImageData(0, 0, this.width, this.height),
                    this.targetImageData
                );

                if (fitness > this.bestFitness) {
                    this.bestFitness = fitness;
                    this.bestText = text;
                    console.log(this.bestText, this.bestFitness);
                }

                this.memo.set(text, fitness);
            }

            return this.memo.get(text) ?? 0;
        });

        if (this.params.onTick) {
            this.params.onTick();
        }

        this.population.mate();
    };

    public start(): void {
        this.isRunning = true;

        const update = () => {
            this.tick();

            if (this.isRunning && this.bestFitness < maxPossibleFitness) {
                requestAnimationFrame(update.bind(this));
            }
        };

        update();
    };

    public getCurrentBest() {
        return {
            string: this.bestText,
            fitness: this.bestFitness
        };
    }

    public getTargetContext(): CanvasRenderingContext2D {
        return this.targetContext;
    }

    public getPopulation(): Darwin<string> {
        return this.population;
    }

    public getContexts(): CanvasRenderingContext2D[] {
        return this.contexts;
    }
}