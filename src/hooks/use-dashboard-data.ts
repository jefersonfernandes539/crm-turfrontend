"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import { DashboardStats, DateRange } from "@/types/Dashboard";
import { rank } from "@/utils/lib/xlsx-utils";

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

  const fetchData = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;

    setLoading(true);
    setError(null);

    try {
      const { data: salesData, error: salesError } = await supabase
        .from("spreadsheet_sales")
        .select("*");

      if (salesError) throw salesError;

      const filteredSales = (salesData || []).filter((sale: any) => {
        const saleDate = new Date(sale.data);
        return saleDate >= dateRange.from! && saleDate <= dateRange.to!;
      });

      const totalPix = filteredSales.reduce(
        (acc, sale) => acc + (Number(sale.pix) || 0),
        0
      );

      const salesCount = filteredSales.length;

      const ranking = rank(
        filteredSales.map((s) => ({
          vendedor: s.vendedor,
          comissao: s.comissao,
        }))
      ).sort((a, b) => b.total - a.total);

      const topSeller = ranking.length > 0 ? ranking[0].vendedor : "—";

      const { data: reservationsData, error: reservationsError } =
        await supabase
          .from("reservations")
          .select("*, operators(name), sellers(name)");

      if (reservationsError) throw reservationsError;

      const parceiroRanking: Record<string, number> = (reservationsData || [])
        .filter((r: any) => {
          const d = new Date(r.date);
          return (
            dateRange.from &&
            dateRange.to &&
            d >= dateRange.from &&
            d <= dateRange.to
          );
        })
        .reduce((acc: Record<string, number>, r: any) => {
          const key = r.operators?.name || "—";
          acc[key] = (acc[key] || 0) + Number(r.total_items_net || 0);
          return acc;
        }, {});

      const parceiroMesName =
        Object.keys(parceiroRanking).length > 0
          ? Object.entries(parceiroRanking).sort((a, b) => b[1] - a[1])[0][0]
          : "—";
      const parceiroMesTotal = parceiroRanking[parceiroMesName] || 0;

      setStats({
        receita: formatCurrency(totalPix),
        qtd: String(salesCount),
        comissoes: formatCurrency(
          filteredSales.reduce((acc, s) => acc + (Number(s.comissao) || 0), 0)
        ),
        topVendedor: topSeller,
        parceiroMes: {
          name: parceiroMesName,
          total: parceiroMesTotal,
          photo_url: null,
        },
      });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      setStats(INITIAL_STATS);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();

    const salesChannel = supabase
      .channel("sales-live-home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spreadsheet_sales" },
        fetchData
      )
      .subscribe();

    const reservationsChannel = supabase
      .channel("reservations-live-home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(reservationsChannel);
    };
  }, [fetchData]);

  return { stats, loading, error, refetch: fetchData };
};
