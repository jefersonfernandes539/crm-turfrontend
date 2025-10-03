"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { supabase } from "@/services/supabaseClient";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import { Toast } from "@/components";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Operator {
  id: string;
  name: string;
}

interface ReservationItem {
  subtotal: number;
  name: string;
}

interface Reservation {
  id: string;
  reservation_items: ReservationItem[];
}

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [reportData, setReportData] = useState({
    totalReservations: 0,
    totalNetValue: 0,
    topTours: [] as [string, number][],
  });

  // Buscar lista de parceiros
  const fetchOperators = useCallback(async () => {
    const { data, error } = await supabase
      .from("operators")
      .select("id, name")
      .order("name");

    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao buscar operadoras.",
        description: error.message,
      });
    } else if (data) {
      setOperators(data);
      if (data.length > 0) {
        setSelectedOperator(data[0].id);
      }
    }
  }, []);

  const fetchReportData = useCallback(async (operatorId: string) => {
    if (!operatorId) {
      setReportData({
        totalReservations: 0,
        totalNetValue: 0,
        topTours: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: reservationsData, error: reservationsError } = await supabase
      .from("reservations")
      .select("id, reservation_items(subtotal, name)")
      .eq("operator_id", operatorId);

    if (reservationsError) {
      Toast.Base({
        variant: "error",
        title: "Erro ao buscar relatório.",
        description: reservationsError.message,
      });
      setReportData({
        totalReservations: 0,
        totalNetValue: 0,
        topTours: [],
      });
    } else if (reservationsData) {
      const totalReservations = reservationsData.length;
      let totalNetValue = 0;
      const tourCounts: Record<string, number> = {};

      (reservationsData as Reservation[]).forEach((reservation) => {
        reservation.reservation_items.forEach((item) => {
          totalNetValue += item.subtotal;
          tourCounts[item.name] = (tourCounts[item.name] || 0) + 1;
        });
      });

      const sortedTours = Object.entries(tourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      setReportData({
        totalReservations,
        totalNetValue,
        topTours: sortedTours,
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  useEffect(() => {
    if (selectedOperator) {
      fetchReportData(selectedOperator);
    } else {
      setLoading(false);
    }
  }, [selectedOperator, fetchReportData]);

  const chartData = {
    labels: reportData.topTours.map(
      ([name]) => name.substring(0, 20) + (name.length > 20 ? "..." : "")
    ),
    datasets: [
      {
        label: "Nº de Reservas",
        data: reportData.topTours.map(([, count]) => count),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top 10 Passeios Mais Vendidos",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Relatórios por Parceiro
          </h1>
          <p className="text-muted-foreground">
            Analise o desempenho de cada operadora.
          </p>
        </div>
        <Select onValueChange={setSelectedOperator} value={selectedOperator}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Selecione uma operadora..." />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op.id} value={op.id}>
                {op.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total de Reservas</CardTitle>
                <CardDescription>
                  Número de reservas distintas para a operadora selecionada.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {reportData.totalReservations}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Valor NET Total</CardTitle>
                <CardDescription>
                  Soma de todos os valores NET para a operadora.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {formatCurrency(reportData.totalNetValue)}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Passeios Mais Vendidos</CardTitle>
              <CardDescription>
                Os passeios mais populares para esta operadora.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.topTours.length > 0 ? (
                <div className="h-[400px]">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  Nenhum dado de passeio encontrado para esta operadora.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
};

export default ReportsPage;
