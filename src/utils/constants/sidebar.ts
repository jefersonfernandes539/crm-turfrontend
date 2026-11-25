import {
  LayoutDashboard,
  Users,
  HandCoins,
  ClipboardClock,
  ReceiptText,
  ClipboardMinus,
  Trophy,
  Sailboat,
  ShoppingCart,
  CalendarRange,
  BedDouble,
  Tent,
  type LucideIcon,
} from "lucide-react";

const DASHBOARD_PREFIX = "/dashboard";
const PARTNERS_PREFIX = `${DASHBOARD_PREFIX}/partners`;
const REPORTS_PREFIX = `${DASHBOARD_PREFIX}/reports`;
const RESERVE_PREFIX = `${DASHBOARD_PREFIX}/reserve`;
const SELLERS_PREFIX = `${DASHBOARD_PREFIX}/sellers`;
const VOUCHERS_PREFIX = `${DASHBOARD_PREFIX}/voucher`;
const LODGING_PREFIX = `${DASHBOARD_PREFIX}/lodging`;
const SALES_HOME_PREFIX = `${DASHBOARD_PREFIX}/sales/home`;
const SALES_RANKING_PREFIX = `${DASHBOARD_PREFIX}/sales/ranking`;
const SALES_REPORTS_PREFIX = `${DASHBOARD_PREFIX}/sales/reports`;
const SALES_NEWSALE_PREFIX = `${DASHBOARD_PREFIX}/sales/new-sale`;

export type NavLink = {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Quando true, só fica ativo na URL exata (sem sub-rotas). */
  exact?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavLink[];
};

export const sidebarGroups: NavGroup[] = [
  {
    label: "Visão geral",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: DASHBOARD_PREFIX,
        exact: true,
      },
    ],
  },
  {
    label: "Operação",
    items: [
      { title: "Reservas", icon: ClipboardClock, url: RESERVE_PREFIX },
      { title: "Vouchers", icon: ReceiptText, url: VOUCHERS_PREFIX },
      { title: "Parceiros", icon: Sailboat, url: PARTNERS_PREFIX },
      { title: "Vendedores", icon: Users, url: SELLERS_PREFIX },
      { title: "Relatórios", icon: ClipboardMinus, url: REPORTS_PREFIX },
    ],
  },
  {
    label: "Hospedagem",
    items: [
      {
        title: "Mapa de ocupação",
        icon: CalendarRange,
        url: LODGING_PREFIX,
        exact: true,
      },
      { title: "Estadias", icon: BedDouble, url: `${LODGING_PREFIX}/stays` },
      { title: "Acomodações", icon: Tent, url: `${LODGING_PREFIX}/units` },
    ],
  },
  {
    label: "Vendas",
    items: [
      { title: "Painel de vendas", icon: HandCoins, url: SALES_HOME_PREFIX },
      { title: "Nova venda", icon: ShoppingCart, url: SALES_NEWSALE_PREFIX },
      { title: "Ranking", icon: Trophy, url: SALES_RANKING_PREFIX },
      {
        title: "Relatórios de vendas",
        icon: ClipboardMinus,
        url: SALES_REPORTS_PREFIX,
      },
    ],
  },
];

const normalizePath = (path: string) =>
  path.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

export const isNavLinkActive = (pathname: string, link: NavLink) => {
  const current = normalizePath(pathname);
  const target = normalizePath(link.url);
  if (link.exact) return current === target;
  return current === target || current.startsWith(`${target}/`);
};

/** Títulos de sub-rotas conhecidas, exibidos no breadcrumb do cabeçalho. */
const SUB_PAGE_TITLES: { match: RegExp; title: string }[] = [
  { match: /\/reserve\/new$/, title: "Nova reserva" },
  { match: /\/reserve\/new-voucher\//, title: "Gerar voucher" },
  { match: /\/voucher\/new$/, title: "Novo voucher" },
  { match: /\/voucher\/edit\//, title: "Editar voucher" },
  { match: /\/partners\/details\//, title: "Detalhes do parceiro" },
  { match: /\/sales\/ranking\/[^/]+$/, title: "Perfil do vendedor" },
];

export const getBreadcrumb = (pathname: string) => {
  const current = normalizePath(pathname);
  for (const group of sidebarGroups) {
    const link = group.items.find((item) => isNavLinkActive(current, item));
    if (!link) continue;
    const sub = SUB_PAGE_TITLES.find((s) => s.match.test(current));
    return { group: group.label, page: link, subPage: sub?.title };
  }
  return null;
};
