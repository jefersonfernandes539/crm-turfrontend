"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";

import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  AlertCircle,
  TrendingUp,
  FileText,
  BarChart,
  User,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { StatCard } from "./components/stat-card";
import { PartnerOfTheMonthCard } from "./components/partner-of-month-card";
import Link from "next/link";

const DATE_PRESETS: { label: string; value: DateRange }[] = [
  { label: "Hoje", value: { from: new Date(), to: new Date() } },
  {
    label: "Últimos 7 dias",
    value: { from: dayjs().subtract(7, "day").toDate(), to: new Date() },
  },
  {
    label: "Últimos 30 dias",
    value: { from: dayjs().subtract(30, "day").toDate(), to: new Date() },
  },
  {
    label: "Este mês",
    value: {
      from: dayjs().startOf("month").toDate(),
      to: dayjs().endOf("month").toDate(),
    },
  },
  {
    label: "Mês passado",
    value: {
      from: dayjs().subtract(1, "month").startOf("month").toDate(),
      to: dayjs().subtract(1, "month").endOf("month").toDate(),
    },
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: dayjs().startOf("month").toDate(),
    to: dayjs().endOf("month").toDate(),
  });

  const { stats, loading, error, refetch } = useDashboardData(dateRange);

  const formattedDateRange =
    dateRange.from && dateRange.to
      ? `${dayjs(dateRange.from).format("DD/MM")} - ${dayjs(
          dateRange.to
        ).format("DD/MM")}`
      : "Selecione um período";

  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) setDateRange(range);
  };

  const handleNavigation = (path: string) => router.push(path);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const quickActions = [
    {
      title: "Nova Reserva",
      icon: Plus,
      path: "/dashboard/reserve",
    },
    {
      title: "Novo Voucher",
      icon: FileText,
      path: "/dashboard/voucher",
    },
    {
      title: "Nova Venda",
      icon: ShoppingCart,
      path: "/dashboard/sales/new-sale",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-xl card border mb-8"
      >
        <h1 className="text-3xl font-bold">Bem-vindo(a) de volta!</h1>
        <p className="text-muted-foreground">
          Aqui está um resumo rápido das suas operações.
        </p>
      </motion.div>

      <div className="flex justify-between flex-wrap gap-4 items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Dashboard de Reservas
          </h2>
          <p className="text-muted-foreground">
            Visão geral das reservas no período selecionado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
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
          transition={{ duration: 0.3 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            title="Receita Total (Net)"
            value={stats.receita}
            description={formattedDateRange}
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            loading={loading}
            onClick={() => handleNavigation("/dashboard/sales/home")}
          />
          <StatCard
            title="Reservas"
            value={stats.qtd}
            description={formattedDateRange}
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            loading={loading}
            onClick={() => handleNavigation("/dashboard/reserve")}
          />
          <StatCard
            title="Total Comissões (Vendas)"
            value={stats.comissoes}
            description={formattedDateRange}
            icon={<BarChart className="h-5 w-5 text-orange-500" />}
            loading={loading}
            onClick={() => handleNavigation("/dashboard/sales/reports")}
          />
          <StatCard
            title="Top Vendedor"
            value={stats.topVendedor}
            description="Vendedor com mais reservas"
            icon={<User className="h-5 w-5 text-purple-500" />}
            loading={loading}
            onClick={() => handleNavigation("/dashboard/sales/ranking")}
          />

          <PartnerOfTheMonthCard
            partner={stats.parceiroMes}
            loading={loading}
            onClick={() => handleNavigation("/dashboard/sales/ranking")}
          />
        </motion.div>
      </AnimatePresence>

      <motion.div variants={itemVariants} className="rounded-xl card">
        <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Link href={action.path}>
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col justify-center gap-2 hover:border-btj-accent hover:text-btj-text transition-all duration-300 bg-btj-bg backdrop-blur-sm"
                  >
                    <Icon className="w-6 h-6 text-btj-text" />
                    <span className="font-semibold text-btj-text">
                      {action.title}
                    </span>
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
