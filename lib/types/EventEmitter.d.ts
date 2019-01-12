export declare type EventHandler = (value: any) => any;
export declare abstract class EventEmitter {
    private handlers;
    constructor();
    on(ev: string, handler: EventHandler): void;
    protected emit(ev: string, value?: any): void;
    protected bindEvent(em: EventEmitter, ev: string): void;
}
