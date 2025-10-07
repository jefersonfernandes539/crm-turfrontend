"use client";
import { useEffect } from "react";
import { useAuth } from "@/stores/auth";

export default function InitAuth() {
  const initAuth = useAuth((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return null;
}
