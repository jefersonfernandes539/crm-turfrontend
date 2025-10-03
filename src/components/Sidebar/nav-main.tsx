"use client";

import { ChevronsUpDown, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
    url?: string;
  }[];
}) {
  const pathname = usePathname();
  const normalizePath = (path: string) =>
    path.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  const current = normalizePath(pathname || "/");
  const isActive = (url?: string) =>
    url ? current === normalizePath(url) : false;

  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((section) =>
            section.items && section.items.length > 0 ? (
              <Collapsible
                key={section.title}
                open={open === section.title}
                onOpenChange={() =>
                  setOpen(open === section.title ? null : section.title)
                }
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="items-center mb-2 w-full"
                      tooltip={section.title}
                    >
                      {section.icon && (
                        <section.icon className="h-4 w-4 mr-2" />
                      )}

                      <div className="flex w-full items-center">
                        <span className="flex-1 text-left">
                          {section.title}
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0" />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <div className="ml-6 space-y-1">
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                        >
                          <Link
                            href={item.url}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors
                              ${
                                isActive(item.url)
                                  ? "!text-[#f8b00e] font-semibold"
                                  : "text-gray-400"
                              }
                              hover:!text-[#f8b00e]"`}
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={section.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(section.url)}
                  tooltip={section.title}
                >
                  <Link href={section.url || "#"}>
                    {section.icon && <section.icon className="h-4 w-4" />}
                    <span>{section.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
