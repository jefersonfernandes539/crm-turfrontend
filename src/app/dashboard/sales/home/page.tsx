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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  UserCheck,
  Loader2,
  Upload,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as XLSX from "xlsx";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/stores/auth";
import { formatCurrency, formatDate } from "@/utils/lib/helpers/formatCurrency";
import { inPer, parse, rank } from "@/utils/lib/xlsx-utils";
import { getSellerOptions } from "@/utils/lib/sellers";
import { Toast } from "@/components";
import EditSaleDialog from "./components/edit-sale";

const VendasHome: React.FC = () => {
  const { user } = useAuth();

  const [allSales, setAllSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPix: 0,
    salesCount: 0,
    topSeller: "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [sellerOptions, setSellerOptions] = useState<string[]>([]);

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
    const options = await getSellerOptions();
    setSellerOptions(options);
  }, []);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("sales").select("*");

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
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSellers();
        await fetchSales();
      } catch (error) {
        console.error(error);
      }
    };
    loadData();

    const channel = supabase
      .channel("sales")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => {
          fetchSales();
        }
      )
      .subscribe();
    return () => {
      supabase
        .removeChannel(channel)
        .then(() => {})
        .catch(() => {});
    };
  }, [fetchSellers, fetchSales]);

  useEffect(() => {
    if (!allSales) return;

    const currentFilteredSales = allSales.filter((sale) =>
      inPer(sale.date, currentMonth, currentYear)
    );

    const totalPix = currentFilteredSales.reduce(
      (acc, sale) => acc + (Number(sale.pix_value) || 0),
      0
    );
    const salesCount = currentFilteredSales.length;

    const ranking = rank(
      currentFilteredSales.map((s) => ({
        vendedor: s.seller_id,
        comissao: s.commission,
      }))
    ).sort((a, b) => b.total - a.total);

    const topSeller = ranking.length > 0 ? ranking[0].vendedor : "N/A";

    setStats({ totalPix, salesCount, topSeller });
    setFilteredSales(
      currentFilteredSales
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
    );
  }, [allSales, currentMonth, currentYear]);

  const handleFileUpload = async (file: File) => {
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets["Vendas"] || wb.Sheets[wb.SheetNames[0]];
      if (!ws) throw new Error("Aba 'Vendas' não encontrada.");

      const parsedSales = parse(ws, currentMonth, currentYear, sellerOptions);
      const salesToInsert = parsedSales.map(({ id, ...sale }) => ({
        ...sale,
        user_id: user.id,
      }));

      await supabase.from("sales").delete();
      const { error } = await supabase.from("sales").insert(salesToInsert);
      if (error) throw error;

      Toast.Base({
        title: `${salesToInsert.length} vendas importadas e salvas com sucesso!`,
        description: "Sucesso ao salvar as vendas.",
        variant: "success",
      });
    } catch (error: any) {
      Toast.Base({
        variant: "error",
        title: "Erro ao salvar planilha",
        description: error.message || "Verifique o formato do arquivo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileUpload(file);
    event.target.value = "";
  };

  const handleClearData = async () => {
    if (!user) return;
    const { error } = await supabase.from("sales").delete();
    if (error)
      Toast.Base({
        variant: "error",
        title: "Erro ao limpar dados",
        description: error.message,
      });
    else
      Toast.Base({
        title: "Dados de vendas limpos com sucesso!",
        description: "",
        variant: "success",
      });
  };

  const handleEditSale = (sale: any) => {
    setSelectedSale(sale);
    setIsEditModalOpen(true);
  };

  const handleSaveSale = async (updatedSale: any) => {
    const { id, ...saleToUpdate } = updatedSale;
    const { error } = await supabase
      .from("sales")
      .update(saleToUpdate)
      .eq("id", id);
    if (error)
      Toast.Base({
        variant: "error",
        title: "Erro ao salvar venda",
        description: error.message,
      });
    else
      Toast.Base({
        title: "Venda atualizada com sucesso!",
        description: "",
        variant: "success",
      });
  };

  const handleDeleteSale = async (saleToDelete: any) => {
    const { error } = await supabase
      .from("sales")
      .delete()
      .eq("id", saleToDelete.id);
    if (error)
      Toast.Base({
        variant: "error",
        title: "Erro ao excluir venda",
        description: error.message,
      });
    else
      Toast.Base({
        variant: "success",
        title: "Venda excluída com sucesso!",
        description: "",
      });
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.FC<any>;
  }> = ({ title, value, icon: Icon }) => (
    <Card className="card">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight hologram-text">
              Dashboard de Vendas
            </h1>
            <p className="text-muted-foreground">
              Visão geral das suas vendas no período selecionado.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

            <Button asChild className="btn btn-primary" disabled={isUploading}>
              <label htmlFor="upload-xlsx">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Processando..." : "Upload"}
                <input
                  type="file"
                  id="upload-xlsx"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="btn">
                  <Trash2 className="h-4 w-4 mr-2" /> Limpar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja apagar todos os dados de vendas
                    importados? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Total PIX"
                value={formatCurrency(stats.totalPix)}
                icon={DollarSign}
              />
              <StatCard
                title="Qtd. Vendas"
                value={stats.salesCount}
                icon={ShoppingCart}
              />
              <StatCard
                title="Top Vendedor"
                value={stats.topSeller}
                icon={UserCheck}
              />
            </div>

            <Card className="card">
              <CardHeader>
                <CardTitle>Últimas Vendas</CardTitle>
                <CardDescription>
                  Exibindo as últimas 10 vendas do período. Clique para editar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">PIX</TableHead>
                      <TableHead className="text-right">Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale, index) => (
                        <TableRow
                          key={sale.id || index}
                          onClick={() => handleEditSale(sale)}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell>
                            {sale.client_name || "-"}{" "}
                            {sale.state_uf && `- ${sale.state_uf}`}
                          </TableCell>
                          <TableCell>{formatDate(sale.date)}</TableCell>
                          <TableCell>{sale.seller_id}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(sale.pix_value)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(sale.commission)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhuma venda encontrada para este período.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      <EditSaleDialog
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        sale={selectedSale}
        onSave={handleSaveSale}
        onDelete={handleDeleteSale}
        sellerOptions={sellerOptions}
      />
    </>
  );
};

export default VendasHome;
