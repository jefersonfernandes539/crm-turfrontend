"use client";

import { routes } from "@/utils/constants/routes/routes";
import { Home, IdCardLanyard, MapPinned } from "lucide-react";
import { LinkItemProps } from "../NavItem";

export const SidebarItems = (): LinkItemProps[] => {
  const navItems: LinkItemProps[] = [
    {
      name: "Dashboard",
      icon: Home,
      redirect: routes.authenticated.dashboard.path,
    },
    {
      name: "Locais",
      icon: MapPinned,
      redirect: routes.authenticated.partners.path,
    },
    {
      name: "Funcionários",
      icon: IdCardLanyard,
      redirect: routes.authenticated.reports.path,
    },
  ];

  return navItems;
};
