import { EatersParams } from "./SmartEaters";
import { NeuralNetFunction } from "./NeuralNet";
export declare class EaterAnalysis {
    private cnv;
    private ctx;
    private eater_pos;
    private food_pos;
    private food_dir;
    private lookat;
    private eater_angle;
    private params;
    private brain;
    private paused;
    constructor(params: EatersParams, brain: NeuralNetFunction);
    private on_resize;
    update(): void;
    pause(): void;
    start(): void;
    private tick;
    private render;
    private drawFood;
    private drawEeater;
    readonly domElement: HTMLCanvasElement;
    static fromBlob(blob: Blob | string): Promise<EaterAnalysis>;
}
