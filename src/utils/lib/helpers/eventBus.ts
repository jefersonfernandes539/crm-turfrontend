export const PRICEBOOK_EVENTS = {
  UPDATED: "pricebook:updated",
} as const;

type PricebookEventMap = {
  [PRICEBOOK_EVENTS.UPDATED]: string;
};

type EventCallback<E> = (payload: E) => void;

class TypedEventBus<E extends Record<string, any>> {
  private events: { [K in keyof E]?: EventCallback<E[K]>[] } = {};

  on<K extends keyof E>(event: K, callback: EventCallback<E[K]>) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event]!.push(callback);
  }

  off<K extends keyof E>(event: K, callback: EventCallback<E[K]>) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event]!.filter((cb) => cb !== callback);
  }

  emit<K extends keyof E>(event: K, payload: E[K]) {
    if (!this.events[event]) return;
    this.events[event]!.forEach((cb) => cb(payload));
  }

  removeAllListeners(event?: keyof E) {
    if (event) delete this.events[event];
    else this.events = {};
  }

  getEvents(): (keyof E)[] {
    return Object.keys(this.events) as (keyof E)[];
  }
}

const eventBus = new TypedEventBus<PricebookEventMap>();
export default eventBus;
