export type EventHandler = (value: any) => any;

export abstract class EventEmitter {

    private handlers: Map<string, EventHandler[]>;

    constructor() {
        this.handlers = new Map<string, EventHandler[]>();
    }

    on(ev: string, handler: EventHandler) {
        if (this.handlers.has(ev)) {
            this.handlers.get(ev).push(handler);
        } else {
            this.handlers.set(ev, [handler]);
        }
    }

    protected emit(ev: string, value?: any) {
        if (this.handlers.has(ev)) {
            for (const handler of this.handlers.get(ev)) {
                handler.call(this, value);
            }
        }
    }

    protected bindEvent(em: EventEmitter, ev: string) {
        em.on(ev, value => this.emit(ev, value));
    }
}