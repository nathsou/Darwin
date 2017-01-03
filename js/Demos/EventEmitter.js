//Nathan Soufflet - 22/12/2016
class EventEmitter {
    constructor() {
        this.eventHandlers = new Map();
    }
    on(ev, handler) {
        this.eventHandlers.set(ev, handler);
    }
    emit(ev, value) {
        if (this.eventHandlers.has(ev))
            this.eventHandlers.get(ev).call(this, value);
    }
    bindEvent(em, ev) {
        em.on(ev, (value) => this.emit(ev, value));
    }
}
