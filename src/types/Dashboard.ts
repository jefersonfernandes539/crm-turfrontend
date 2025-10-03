import type React from "react";
export interface DashboardStats {
  receita: string;
  qtd: string;
  comissoes: string;
  topVendedor: string;
  parceiroMes: PartnerOfTheMonth;
}

export interface PartnerOfTheMonth {
  name: string;
  total: number;
  photo_url: string | null;
}

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  loading: boolean;
  onClick?: () => void;
}

export interface PartnerCardProps {
  partner: PartnerOfTheMonth;
  loading: boolean;
  onClick?: () => void;
}

export type DateRange = {
  from?: Date;
  to?: Date;
};

export interface DashboardData {
  receita_net: number;
  qtd: number;
  top_vendedor: string;
  top_count: number;
  parceiro_mes: string;
  parceiro_valor: number;
  parceiro_foto: string | null;
}
