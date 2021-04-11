import { EatersParams } from "./SmartEaters";
import { NeuralNetFunction } from "./NeuralNet";
export declare class EaterAnalysis {
    private cnv;
    private ctx;
    private foodPos;
    private eater;
    private params;
    private brain;
    private paused;
    constructor(params: Required<EatersParams>, brain: NeuralNetFunction);
    private onResize;
    update(): void;
    pause(): void;
    start(): void;
    private tick;
    private render;
    private drawFood;
    private drawEeater;
    get domElement(): HTMLCanvasElement;
    static fromBlob(blob: Blob | string): Promise<EaterAnalysis>;
}
