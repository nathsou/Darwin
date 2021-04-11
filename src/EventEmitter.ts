export type EventHandler = (e: any) => void;

export default abstract class EventEmitter<EventName = string> {
    private eventHandlers: Map<EventName, EventHandler[]>;

    constructor() {
        this.eventHandlers = new Map<EventName, EventHandler[]>();
    }

    public on(ev: EventName, handler: EventHandler): void {
        if (!this.isListening(ev)) {
            this.eventHandlers.set(ev, []);
        }

        this.eventHandlers.get(ev)?.push(handler);
    }

    protected isListening(ev: EventName): boolean {
        return this.eventHandlers.has(ev);
    }

    protected emit(ev: EventName, value?: any, thisArg?: any): void {
        if (this.isListening(ev)) {
            for (const handler of this.eventHandlers.get(ev) ?? []) {
                handler.call(thisArg, value);
            }
        }
    }

    protected bindEvent(em: EventEmitter<EventName>, ev: EventName): void {
        em.on(ev, value => this.emit(ev, value));
    }

    public removeListener(ev: EventName): void {
        this.eventHandlers.delete(ev);
    }

    public removeListeners(): void {
        this.eventHandlers.clear();
    }
}