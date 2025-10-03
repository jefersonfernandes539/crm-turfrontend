"use client";

import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { supabase } from "@/services/supabaseClient";
import { DashboardData, DashboardStats, DateRange } from "@/types/Dashboard";

const INITIAL_STATS: DashboardStats = {
  receita: "R$ 0,00",
  qtd: "0",
  comissoes: "R$ 0,00",
  topVendedor: "—",
  parceiroMes: { name: "—", total: 0, photo_url: null },
};

export const useDashboardData = (dateRange: DateRange) => {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrencyBRL = useCallback((value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  }, []);

  const loadDashboardData = useCallback(
    async (period: DateRange) => {
      if (!period.from || !period.to) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const p_start = dayjs(period.from).startOf("day").toISOString();
      const p_end = dayjs(period.to).add(1, "day").startOf("day").toISOString();

      try {
        const [reservasResult, commissionsResult] = await Promise.allSettled([
          supabase.rpc("dash_reservas", { p_start, p_end }),
          supabase.rpc("dash_total_commissions", { p_start, p_end }),
        ]);

        // Handle reservas data
        if (reservasResult.status === "rejected") {
          throw new Error("Erro ao carregar dados de reservas");
        }

        const { data: dataReservas, error: errorReservas } =
          reservasResult.value;
        if (errorReservas) throw errorReservas;

        // Handle commissions data
        if (commissionsResult.status === "rejected") {
          throw new Error("Erro ao carregar dados de comissões");
        }

        const { data: dataComissoes, error: errorComissoes } =
          commissionsResult.value;
        if (errorComissoes) throw errorComissoes;

        const dashboardData: DashboardData = dataReservas?.[0] ?? {
          receita_net: 0,
          qtd: 0,
          top_vendedor: "—",
          top_count: 0,
          parceiro_mes: "—",
          parceiro_valor: 0,
          parceiro_foto: null,
        };

        setStats({
          receita: formatCurrencyBRL(Number(dashboardData.receita_net)),
          qtd: String(dashboardData.qtd),
          comissoes: formatCurrencyBRL(Number(dataComissoes)),
          topVendedor:
            dashboardData.top_vendedor && dashboardData.top_vendedor !== "—"
              ? `${dashboardData.top_vendedor} (${dashboardData.top_count} vendas)`
              : "—",
          parceiroMes: {
            name: dashboardData.parceiro_mes || "—",
            total: Number(dashboardData.parceiro_valor),
            photo_url: dashboardData.parceiro_foto || null,
          },
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        console.error("Error loading dashboard data:", err);
        setError(errorMessage);
        setStats(INITIAL_STATS);
      } finally {
        setLoading(false);
      }
    },
    [formatCurrencyBRL]
  );

  useEffect(() => {
    loadDashboardData(dateRange);

    // Set up real-time subscriptions
    const salesChannel = supabase
      .channel("sales-live-home")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales",
        },
        () => loadDashboardData(dateRange)
      )
      .subscribe();

    const reservationsChannel = supabase
      .channel("reservations-live-home")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservations",
        },
        () => loadDashboardData(dateRange)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(reservationsChannel);
    };
  }, [dateRange, loadDashboardData]);

  return { stats, loading, error, refetch: () => loadDashboardData(dateRange) };
};
