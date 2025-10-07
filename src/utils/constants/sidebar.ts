import {
  Home,
  Calendar,
  Users,
  HandCoins,
  ClipboardClock,
  ReceiptText,
  ClipboardMinus,
  ListStart,
  Sailboat,
} from "lucide-react";

const DASHBOARD_PREFIX = "/dashboard";
const PARTNERS_PREFIX = `${DASHBOARD_PREFIX}/partners`;
const REPORTS_PREFIX = `${DASHBOARD_PREFIX}/reports`;
const RESERVE_PREFIX = `${DASHBOARD_PREFIX}/reserve`;
const SELLERS_PREFIX = `${DASHBOARD_PREFIX}/sellers`;
const VOUCHERS_PREFIX = `${DASHBOARD_PREFIX}/voucher`;
const SALES_HOME_PREFIX = `${DASHBOARD_PREFIX}/sales/home`;
const SALES_RANKING_PREFIX = `${DASHBOARD_PREFIX}/sales/ranking`;
const SALES_REPORTS_PREFIX = `${DASHBOARD_PREFIX}/sales/reports`;
const SALES_NEWSALE_PREFIX = `${DASHBOARD_PREFIX}/sales/new-sale`;

export const sidebarData = {
  navMain: [
    {
      title: "Reservas",
      url: "#",
      icon: Calendar,
      isActive: true,
      items: [
        {
          icon: Home,
          title: "Dashboard",
          url: DASHBOARD_PREFIX,
        },
        {
          title: "Reservas",
          icon: ClipboardClock,
          url: RESERVE_PREFIX,
        },
        {
          title: "Parceiros",
          icon: Sailboat,
          url: PARTNERS_PREFIX,
        },
        {
          title: "Vendedores",
          icon: Users,
          url: SELLERS_PREFIX,
        },
        {
          title: "Vouchers",
          icon: ReceiptText,
          url: VOUCHERS_PREFIX,
        },
        {
          title: "Relatórios",
          icon: ClipboardMinus,
          url: REPORTS_PREFIX,
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Vendas",
      url: "#",
      icon: HandCoins,
      isActive: true,
      items: [
        {
          icon: Home,
          title: "Home",
          url: SALES_HOME_PREFIX,
        },
        {
          title: "Ranking",
          icon: ListStart,
          url: SALES_RANKING_PREFIX,
        },
        {
          title: "Relatórios",
          icon: ClipboardMinus,
          url: SALES_REPORTS_PREFIX,
        },
        {
          title: "Nova Venda",
          icon: HandCoins,
          url: SALES_NEWSALE_PREFIX,
        },
      ],
    },
  ],
};
