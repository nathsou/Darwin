"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventEmitter {
    constructor() {
        this.eventHandlers = new Map();
    }
    on(ev, handler) {
        var _a;
        if (!this.isListening(ev)) {
            this.eventHandlers.set(ev, []);
        }
        (_a = this.eventHandlers.get(ev)) === null || _a === void 0 ? void 0 : _a.push(handler);
    }
    isListening(ev) {
        return this.eventHandlers.has(ev);
    }
    emit(ev, value, thisArg) {
        var _a;
        if (this.isListening(ev)) {
            for (const handler of (_a = this.eventHandlers.get(ev)) !== null && _a !== void 0 ? _a : []) {
                handler.call(thisArg, value);
            }
        }
    }
    bindEvent(em, ev) {
        em.on(ev, value => this.emit(ev, value));
    }
    removeListener(ev) {
        this.eventHandlers.delete(ev);
    }
    removeListeners() {
        this.eventHandlers.clear();
    }
}
exports.default = EventEmitter;
