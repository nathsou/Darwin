export declare type EventHandler = (e: any) => void;
export default abstract class EventEmitter<EventName = string> {
    private event_handlers;
    constructor();
    on(ev: EventName, handler: EventHandler): void;
    protected isListening(ev: EventName): boolean;
    protected emit(ev: EventName, value?: any, thisArg?: any): void;
    protected bindEvent(em: EventEmitter<EventName>, ev: EventName): void;
    removeListener(ev: EventName): void;
    removeListeners(): void;
}
