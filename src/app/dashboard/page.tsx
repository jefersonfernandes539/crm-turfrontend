"use client";

import {
  AlertCircle,
  BarChart,
  FileText,
  RefreshCw,
  TrendingUp,
  User,
} from "lucide-react";
import { StatCard } from "./components/stat-card";
import { PartnerOfTheMonthCard } from "./components/partner-of-month-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { endOfMonth, startOfMonth, subDays } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { AnimatePresence, motion } from "motion/react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useRouter } from "next/navigation";

const DATE_PRESETS: { label: string; value: DateRange }[] = [
  {
    label: "Hoje",
    value: { from: new Date(), to: new Date() },
  },
  {
    label: "Últimos 7 dias",
    value: { from: subDays(new Date(), 7), to: new Date() },
  },
  {
    label: "Últimos 30 dias",
    value: { from: subDays(new Date(), 30), to: new Date() },
  },
  {
    label: "Este mês",
    value: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  },
  {
    label: "Mês passado",
    value: {
      from: startOfMonth(subDays(startOfMonth(new Date()), 1)),
      to: endOfMonth(subDays(startOfMonth(new Date()), 1)),
    },
  },
];

export default function Dashboard() {
  const router = useRouter();

  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { stats, loading, error, refetch } = useDashboardData(dateRange);

  const formattedDateRange =
    dateRange.from && dateRange.to
      ? `${dayjs(dateRange.from).format("DD/MM")} - ${dayjs(
          dateRange.to
        ).format("DD/MM")}`
      : "Selecione um período";

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
    }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  return (
    <>
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-xl card border mb-8"
      >
        <h1 className="text-3xl font-bold">Bem-vindo(a) de volta!</h1>
        <p className="text-btj-muted">
          Aqui está um resumo rápido das suas operações.
        </p>
      </motion.div>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-btj-text">
              Dashboard de Reservas
            </h2>
            <p className="text-btj-muted">
              Visão geral das reservas no período selecionado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            )}

            <DateRangePicker
              date={dateRange}
              onDateChange={handleDateChange}
              presets={DATE_PRESETS}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar dados: {error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={formattedDateRange}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              title="Receita Total (Net)"
              value={stats.receita}
              description={formattedDateRange}
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
              loading={loading}
              onClick={() => handleNavigation("/reservas/lista")}
            />

            <StatCard
              title="Reservas"
              value={stats.qtd}
              description={formattedDateRange}
              icon={<FileText className="h-5 w-5 text-blue-500" />}
              loading={loading}
              onClick={() => handleNavigation("/reservas/lista")}
            />

            <StatCard
              title="Total Comissões (Vendas)"
              value={stats.comissoes}
              description={formattedDateRange}
              icon={<BarChart className="h-5 w-5 text-orange-500" />}
              loading={loading}
              onClick={() => handleNavigation("/vendas/ranking")}
            />

            <StatCard
              title="Top Vendedor"
              value={stats.topVendedor}
              description="Vendedor com mais reservas"
              icon={<User className="h-5 w-5 text-purple-500" />}
              loading={loading}
              onClick={() => handleNavigation("/reservas/lista")}
            />

            <PartnerOfTheMonthCard
              partner={stats.parceiroMes}
              loading={loading}
              onClick={() => handleNavigation("/reservas/relatorios")}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
