/**
 * Substitui o Realtime do Supabase por polling leve: enquanto a aba está
 * visível, chama o callback a cada `POLL_MS` (e ao voltar para a aba).
 * Mantém a mesma API: db.channel(...).on(...).subscribe() / db.removeChannel(ch)
 */
const POLL_MS = 15_000;

type Callback = (payload: unknown) => void;

export class PollingChannel {
  private callbacks: Callback[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private onVisible = () => {
    if (document.visibilityState === "visible") this.fire();
  };

  constructor(public readonly name: string) {}

  on(_event: string, _filter: unknown, callback: Callback) {
    this.callbacks.push(callback);
    return this;
  }

  subscribe() {
    if (typeof window === "undefined" || this.timer) return this;
    this.timer = setInterval(() => {
      if (document.visibilityState === "visible") this.fire();
    }, POLL_MS);
    document.addEventListener("visibilitychange", this.onVisible);
    return this;
  }

  unsubscribe() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisible);
    }
  }

  private fire() {
    this.callbacks.forEach((cb) => cb({ eventType: "POLL" }));
  }
}
