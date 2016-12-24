//Nathan Soufflet - 22/12/2016

abstract class EventEmitter {

    eventHandlers: Map<string, (value) => any>;

    constructor() {
        this.eventHandlers = new Map<string, (value) => any>();
    }

    on(ev: string, handler: (value) => any) {
        this.eventHandlers.set(ev, handler);
    }

    protected emit(ev: string, value?: any) {

        if (this.eventHandlers.has(ev))
            this.eventHandlers.get(ev).call(this, value);
    }

    protected bindEvent(em: EventEmitter, ev: string) {

        em.on(ev, (value) => this.emit(ev, value));
    }
}