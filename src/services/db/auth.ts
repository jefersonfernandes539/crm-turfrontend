import type { AuthSession, AuthUser, DbError } from "./types";

type AuthEvent = "SIGNED_IN" | "SIGNED_OUT" | "INITIAL_SESSION";
type Listener = (event: AuthEvent, session: AuthSession | null) => void;

const listeners = new Set<Listener>();
const emit = (event: AuthEvent, session: AuthSession | null) =>
  listeners.forEach((l) => l(event, session));

// Evita várias chamadas simultâneas a /api/auth/session no carregamento
let sessionPromise: Promise<AuthSession | null> | null = null;
let sessionAt = 0;

async function fetchSession(force = false): Promise<AuthSession | null> {
  if (!force && sessionPromise && Date.now() - sessionAt < 5_000) return sessionPromise;
  sessionAt = Date.now();
  sessionPromise = fetch("/api/auth/session", { credentials: "same-origin" })
    .then((r) => (r.ok ? r.json() : { user: null }))
    .then((b: { user: AuthUser | null }) => (b.user ? { user: b.user } : null))
    .catch(() => null);
  return sessionPromise;
}

async function postAuth(path: string, body?: unknown) {
  const res = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data } as {
    ok: boolean;
    data: { user?: AuthUser; error?: DbError };
  };
}

type Credentials = { email: string; password: string; options?: { data?: { name?: string } } };

export const auth = {
  async getSession() {
    const session = await fetchSession();
    return { data: { session }, error: null };
  },

  async getUser() {
    const session = await fetchSession();
    return { data: { user: session?.user ?? null }, error: null };
  },

  onAuthStateChange(callback: Listener) {
    listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners.delete(callback);
          },
        },
      },
    };
  },

  async signInWithPassword({ email, password }: Credentials) {
    const { ok, data } = await postAuth("login", { email, password });
    if (!ok || !data.user) {
      return {
        data: { user: null, session: null },
        error: data.error ?? { message: "Falha no login" },
      };
    }
    const session = { user: data.user };
    sessionPromise = Promise.resolve(session);
    sessionAt = Date.now();
    emit("SIGNED_IN", session);
    return { data: { user: data.user, session }, error: null };
  },

  async signUp({ email, password, options }: Credentials) {
    const { ok, data } = await postAuth("register", {
      email,
      password,
      name: options?.data?.name,
    });
    if (!ok || !data.user) {
      return {
        data: { user: null, session: null },
        error: data.error ?? { message: "Falha no cadastro" },
      };
    }
    const session = { user: data.user };
    sessionPromise = Promise.resolve(session);
    sessionAt = Date.now();
    emit("SIGNED_IN", session);
    return { data: { user: data.user, session }, error: null };
  },

  async signOut() {
    await postAuth("logout");
    sessionPromise = Promise.resolve(null);
    sessionAt = Date.now();
    emit("SIGNED_OUT", null);
    return { error: null };
  },
};
