"use client";

import { Layout } from "@/components";
import InitAuth from "./components/init-auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout.Dashboard>
      <InitAuth />
      {children}
    </Layout.Dashboard>
  );
}
