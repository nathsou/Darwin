export type EventHandler = (value: any) => any;

export abstract class EventEmitter {

    private handlers: Map<string, EventHandler[]>;

    constructor() {
        // This Map is often unused, it is therfore best to initialize it only when needed
        // i.e  when the on() method is called for the first time
        // this.handlers = new Map<string, EventHandler[]>();
    }

    on(ev: string, handler: EventHandler) {
        if (this.handlers === undefined) {
            this.handlers = new Map<string, EventHandler[]>();
        }

        if (this.handlers.has(ev)) {
            this.handlers.get(ev).push(handler);
        } else {
            this.handlers.set(ev, [handler]);
        }
    }

    protected emit(ev: string, value?: any) {
        if (this.handlers !== undefined && this.handlers.has(ev)) {
            for (const handler of this.handlers.get(ev)) {
                handler.call(this, value);
            }
        }
    }

    protected bindEvent(em: EventEmitter, ev: string) {
        em.on(ev, value => this.emit(ev, value));
    }
}