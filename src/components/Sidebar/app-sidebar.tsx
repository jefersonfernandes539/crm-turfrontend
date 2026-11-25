"use client";

import * as React from "react";
import Link from "next/link";
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { sidebarGroups } from "@/utils/constants/sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="TurHost CRM"
              className="hover:bg-transparent active:bg-transparent"
            >
              <Link href="/dashboard">
                {/* Menu recolhido: só as iniciais */}
                <span className="hidden size-8 shrink-0 items-center justify-center text-xs font-extrabold text-sky-500 group-data-[collapsible=icon]:flex">
                  TH
                </span>
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-extrabold tracking-wide bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
                    TURHOST CRM
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Turismo e hospedagem
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={sidebarGroups} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
