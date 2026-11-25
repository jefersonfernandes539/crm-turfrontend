// stores/auth.ts
"use client";

import { db } from "@/services/db";
import { create } from "zustand";

type AuthState = {
  user: any | null;
  session: any | null;
  loading: boolean;
  onLogin: (data: { email: string; password: string }) => Promise<void>;
  onRegister: (data: { email: string; password: string }) => Promise<void>;
  onLogout: () => Promise<void>;
  initAuth: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true, // começa em loading

  // inicializa pegando sessão atual + listener
  initAuth: async () => {
    const { data } = await db.auth.getSession();
    set({
      user: data.session?.user ?? null,
      session: data.session,
      loading: false,
    });

    db.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });
  },

  onLogin: async ({ email, password }) => {
    set({ loading: true });
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      throw error;
    }

    set({
      user: data.user,
      session: data.session,
      loading: false,
    });
  },

  onRegister: async ({ email, password }) => {
    set({ loading: true });
    const { data, error } = await db.auth.signUp({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      throw error;
    }

    set({
      user: data.user,
      session: data.session,
      loading: false,
    });
  },

  onLogout: async () => {
    await db.auth.signOut();
    set({ user: null, session: null });
  },
}));
