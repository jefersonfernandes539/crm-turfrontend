"use client";

import { useEffect, useState } from "react";
import type { AuthUser as User } from "@/services/db";
import { db } from "@/services/db";

export type CurrentUser = {
  name: string;
  email: string;
  initials: string;
};

const toCurrentUser = (u: User | null | undefined): CurrentUser | null => {
  if (!u) return null;
  const email = u.email || "";
  const name: string =
    u.user_metadata?.name || u.user_metadata?.full_name || email.split("@")[0];
  const initials =
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  return { name, email, initials };
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      setUser(toCurrentUser(session?.user));
    });

    const { data: listener } = db.auth.onAuthStateChange(
      (_event, session) => setUser(toCurrentUser(session?.user))
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return user;
}
