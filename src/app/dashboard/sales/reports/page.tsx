"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Loader2, DollarSign, ShoppingCart, Percent } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import { inPer, rank } from "@/utils/lib/xlsx-utils";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
}) => (
  <Card className="card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const SalesReports = () => {
  const { user } = useAuth();
  const [allSales, setAllSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: new Date(0, i).toLocaleString("pt-BR", { month: "long" }),
      })),
    []
  );
  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
    []
  );

  const fetchSales = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("spreadsheet_sales")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao buscar vendas",
        description: error.message,
      });
      setAllSales([]);
    } else {
      setAllSales(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      await fetchSales();
    };
    loadData();

    const channel = supabase
      .channel("spreadsheet_sales-reports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spreadsheet_sales" },
        () => fetchSales()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSales]);

  const salesInPeriod = useMemo(
    () =>
      allSales.filter((sale) => inPer(sale.data, currentMonth, currentYear)),
    [allSales, currentMonth, currentYear]
  );

  const chartData = useMemo(() => {
    const rankedSellers = rank(salesInPeriod).sort((a, b) => b.total - a.total);
    const sellerLabels = rankedSellers.map((s: any) => s.vendedor);
    const commissionData = rankedSellers.map((s: any) => s.total);

    const paymentTypes = salesInPeriod.reduce(
      (acc: Record<string, number>, sale) => {
        const type = sale.tipo || "N/A";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      bar: {
        labels: sellerLabels,
        datasets: [
          {
            label: "Total Comissão (R$)",
            data: commissionData,
            backgroundColor: "rgba(18, 181, 208, 0.6)",
            borderColor: "rgba(18, 181, 208, 1)",
            borderWidth: 1,
          },
        ],
      },
      pie: {
        labels: Object.keys(paymentTypes),
        datasets: [
          {
            label: "Vendas por Tipo de Pagamento",
            data: Object.values(paymentTypes),
            backgroundColor: [
              "rgba(12, 59, 107, 0.7)",
              "rgba(255, 99, 132, 0.7)",
              "rgba(255, 206, 86, 0.7)",
            ],
            borderColor: ["#0C3B6B", "#FF6384", "#FFCE56"],
            borderWidth: 1,
          },
        ],
      },
    };
  }, [salesInPeriod]);

  const stats = useMemo(() => {
    const totalCommission = salesInPeriod.reduce(
      (acc, sale) => acc + (Number(sale.comissao) || 0),
      0
    );
    const totalPix = salesInPeriod.reduce(
      (acc, sale) => acc + (Number(sale.pix) || 0),
      0
    );
    const salesCount = salesInPeriod.length;
    return { totalCommission, totalPix, salesCount };
  }, [salesInPeriod]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "var(--text)" } },
      title: { display: true, color: "var(--text)" },
    },
    scales: {
      x: { ticks: { color: "var(--muted)" }, grid: { color: "var(--border)" } },
      y: { ticks: { color: "var(--muted)" }, grid: { color: "var(--border)" } },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight hologram-text">
            Relatórios de Vendas
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho de vendas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={currentMonth.toString()}
            onValueChange={(val) => setCurrentMonth(Number(val))}
          >
            <SelectTrigger className="w-[160px] chip">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentYear.toString()}
            onValueChange={(val) => setCurrentYear(Number(val))}
          >
            <SelectTrigger className="w-[110px] chip">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : salesInPeriod.length > 0 ? (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <StatCard
              title="Total Comissão"
              value={formatCurrency(stats.totalCommission)}
              icon={DollarSign}
            />
            <StatCard
              title="Total PIX"
              value={formatCurrency(stats.totalPix)}
              icon={Percent}
            />
            <StatCard
              title="Qtd. Vendas"
              value={stats.salesCount}
              icon={ShoppingCart}
            />
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="card w-full">
              <CardHeader>
                <CardTitle>Comissão por Vendedor</CardTitle>
                <CardDescription>
                  Total de comissão acumulada por cada vendedor no período.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full">
                <Bar data={chartData.bar} options={chartOptions} />
              </CardContent>
            </Card>

            <Card className="card w-full">
              <CardHeader>
                <CardTitle>Vendas por Tipo de Pagamento</CardTitle>
                <CardDescription>
                  Distribuição do número de vendas por tipo de pagamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full flex items-center justify-center">
                <Pie
                  data={chartData.pie}
                  options={{ ...chartOptions, scales: {} }}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="card">
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">
              Não há dados de vendas para gerar relatórios neste período.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default SalesReports;
