// stores/auth.ts
"use client";

import { supabase } from "@/services/supabaseClient";
import { create } from "zustand";

type AuthState = {
  user: any | null;
  session: any | null;
  loading: boolean;
  onLogin: (data: { email: string; password: string }) => Promise<void>;
  onRegister: (data: { email: string; password: string }) => Promise<void>;
  onLogout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,

  onLogin: async ({ email, password }) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      throw error;
    }

    // o usuário precisa confirmar o e-mail (dependendo da config do Supabase)
    set({
      user: data.user,
      session: data.session,
      loading: false,
    });
  },

  onLogout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
