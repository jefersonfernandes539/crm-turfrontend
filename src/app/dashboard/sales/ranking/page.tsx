"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { Crown, Medal, Award, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuth } from "@/stores/auth";
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import { inPer, rank } from "@/utils/lib/xlsx-utils";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import { useRouter } from "next/navigation";

const COLORS = ["#FFD700", "#C0C0C0", "#CD7F32", "#4F46E5"];

const SalesRanking: React.FC = () => {
  const [ranking, setRanking] = useState<any[]>([]);
  const [allSales, setAllSales] = useState<any[]>([]);
  const [sellers, setSellers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const { user } = useAuth();
  const router = useRouter();

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

  const fetchSellers = useCallback(async () => {
    const { data, error } = await supabase
      .from("sellers")
      .select("name, photo_url");
    if (error) return console.error(error);
    const map = (data || []).reduce((acc: any, s: any) => {
      acc[s.name] = s.photo_url;
      return acc;
    }, {});
    setSellers(map);
  }, []);

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
    const initialize = async () => {
      await fetchSellers();
      await fetchSales();
    };

    initialize();

    const channel = supabase
      .channel("spreadsheet_sales")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spreadsheet_sales" },
        fetchSales
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSellers, fetchSales]);

  useEffect(() => {
    const salesInPeriod = allSales.filter((sale) =>
      inPer(sale.data, currentMonth, currentYear)
    );
    const ranked = rank(salesInPeriod).sort((a, b) => b.total - a.total);
    setRanking(ranked);
  }, [allSales, currentMonth, currentYear]);

  const top3 = ranking.slice(0, 3);
  const barData = ranking.map((seller, index) => ({
    name: seller.vendedor,
    total: seller.total,
    index,
  }));

  if (!user) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-muted-foreground">Aguarde, carregando usuário...</p>
      </div>
    );
  }

  const getSlug = (name: string) =>
    (name || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, "");

  const handleCardClick = (vendedor: string) => {
    const slug = getSlug(vendedor);
    router.push(
      `/dashboard/sales/ranking/${slug}?m=${currentMonth}&y=${currentYear}`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight hologram-text">
            Ranking de Vendas
          </h1>
          <p className="text-muted-foreground">
            Classificação dos vendedores por total de comissão no período.
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

      {/* Cards de ranking */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : ranking.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {top3.map((s, i) => {
              const icons = [Crown, Medal, Award];
              const Icon = icons[i];
              return (
                <Card
                  key={s.vendedor}
                  className="card text-center transition-transform hover:scale-105 cursor-pointer"
                  onClick={() => handleCardClick(s.vendedor)}
                >
                  <CardHeader>
                    <Avatar className="w-20 h-20 mx-auto border-4 border-primary/50">
                      <AvatarImage
                        src={
                          sellers[s.vendedor] || "/assets/avatar-fallback.png"
                        }
                        alt={s.vendedor}
                      />
                      <AvatarFallback>
                        <Icon className="h-8 w-8 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  </CardHeader>
                  <CardContent>
                    <CardTitle>{s.vendedor}</CardTitle>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(s.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {s.qtd} vendas
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Gráfico */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ranking Visual</CardTitle>
              <CardDescription>
                Comparação do total de comissão entre vendedores
              </CardDescription>
            </CardHeader>
            <CardContent style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tickFormatter={(val: any) => formatCurrency(val)} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="total">
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index] || COLORS[3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="card">
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">
              Não há dados de vendas para gerar o ranking neste período.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default SalesRanking;
