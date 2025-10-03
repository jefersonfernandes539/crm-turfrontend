"use client";

import { routes } from "@/utils/constants/routes/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push(routes.public.auth.login);
  }, [router]);
  return <div />;
}
