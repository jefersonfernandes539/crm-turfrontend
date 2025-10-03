"use client";

import * as React from "react";
import { NavMain } from "@/components/Sidebar/nav-main";
import { NavUser } from "@/components/Sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarData as data } from "@/utils/constants/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import Image from "next/image";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>({
    name: "Carregando...",
    email: "",
    avatar: "/default_avatar.svg",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          name: u.user_metadata?.name || "Usuário",
          email: u.email || "",
          avatar: u.user_metadata?.avatar || "/default_avatar.svg",
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const u = session.user;
          setUser({
            name: u.user_metadata?.name || "Usuário",
            email: u.email || "",
            avatar: u.user_metadata?.avatar || "/default_avatar.svg",
          });
        } else {
          setUser({
            name: "Desconhecido",
            email: "",
            avatar: "/default_avatar.svg",
          });
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="justify-start hover:bg-transparent"
            >
              <Link href="/dashboard">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={150}
                  height={150}
                  className="w-auto h-12"
                />
                <span className="text-sm font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent tracking-wide">
                  BEACH TUR JERI
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.navSecondary} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
