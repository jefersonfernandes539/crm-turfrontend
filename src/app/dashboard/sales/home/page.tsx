"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { supabase } from "@/services/supabaseClient";
import { formatCurrency, formatDate } from "@/utils/lib/helpers/formatCurrency";
import { inPer, rank } from "@/utils/lib/xlsx-utils";
import { getSellerOptions } from "@/utils/lib/sellers";
import EditSaleDialog from "./components/edit-sale";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Toast } from "@/components";

const SalesHome: React.FC = () => {
  const [allSales, setAllSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPix: 0,
    salesCount: 0,
    topSeller: "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [sellerOptions, setSellerOptions] = useState<string[]>([]);
  const [sellerMap, setSellerMap] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    const { data, error } = await supabase
      .from("sellers")
      .select("id, name, photo_url");

    if (!error && data) {
      const map = data.reduce((acc, s) => {
        acc[s.name] = s.photo_url || "";
        return acc;
      }, {} as { [key: string]: string });
      setSellerMap(map);
    }
  }, []);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("spreadsheet_sales").select("*");

    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao buscar vendas",
        description: error.message,
      });
      setAllSales([]);
    } else {
      const mappedData = data.map((s) => ({ ...s, seller_name: s.vendedor }));
      setAllSales(mappedData || []);
    }

    setLoading(false);
  }, []);

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
    if (!allSales) return;

    const currentFilteredSales = allSales.filter((sale) =>
      inPer(sale.data, currentMonth, currentYear)
    );

    const totalPix = currentFilteredSales.reduce(
      (acc, sale) => acc + (Number(sale.pix) || 0),
      0
    );
    const salesCount = currentFilteredSales.length;

    const ranking = rank(
      currentFilteredSales.map((s) => ({
        vendedor: s.seller_name,
        comissao: s.comissao,
      }))
    ).sort((a, b) => b.total - a.total);

    const topSeller = ranking.length > 0 ? ranking[0].vendedor : "N/A";

    setStats({ totalPix, salesCount, topSeller });
    setFilteredSales(currentFilteredSales.slice(0, 10));
  }, [allSales, currentMonth, currentYear]);

  const handleEditSale = (sale: any) => {
    setSelectedSale(sale);
    setIsEditModalOpen(true);
  };

  const handleSaveSale = async (updatedSale: any) => {
    const { id, ...saleToUpdate } = updatedSale;
    const { error } = await supabase
      .from("spreadsheet_sales")
      .update(saleToUpdate)
      .eq("id", id);

    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao salvar venda",
        description: error.message,
      });
    } else {
      Toast.Base({
        variant: "success",
        title: "Venda atualizada!",
        description: "",
      });
      fetchSales();
    }
  };

  const handleDeleteSale = async (saleToDelete: any) => {
    const { error } = await supabase
      .from("spreadsheet_sales")
      .delete()
      .eq("id", saleToDelete.id);

    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao excluir venda",
        description: error.message,
      });
    } else {
      Toast.Base({
        variant: "success",
        title: "Venda excluída!",
        description: "",
      });
      fetchSales();
    }
  };

  // ✅ Upload com Toast.Base + Toast.Update
  const handleUpload = async (file: File) => {
    let toastId: string | number;

    try {
      toastId = Toast.Base({
        variant: "loading",
        title: "Importando planilha...",
        description: "Aguarde enquanto processamos os dados.",
        duration: 999999,
      });

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet =
        workbook.Sheets["Vendas"] || workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("Aba 'Vendas' não encontrada.");

      const parsed = XLSX.utils.sheet_to_json(sheet);
      const { error } = await supabase.from("spreadsheet_sales").insert(parsed);
      if (error) throw error;

      Toast.Update({
        id: toastId,
        variant: "success",
        title: "Importação concluída!",
        description: `${parsed.length} vendas importadas com sucesso.`,
        duration: 4000,
      });

      fetchSales();
    } catch (err: any) {
      Toast.Update({
        id: toastId!,
        variant: "error",
        title: "Erro ao importar planilha",
        description: err.message,
      });
    }
  };

  const handleClearSales = async () => {
    try {
      await supabase.from("spreadsheet_sales").delete();
      Toast.Base({
        variant: "success",
        title: "Vendas limpas com sucesso!",
        description: "",
      });
      fetchSales();
    } catch (err: any) {
      Toast.Base({
        variant: "error",
        title: "Erro ao limpar vendas",
        description: err.message,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight hologram-text">
          Dashboard de Vendas
        </h1>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Seleção de mês */}
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

          {/* Seleção de ano */}
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

          {/* Botão Importar */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Importar
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />

          {/* Botão limpar */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Limpar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar dados de vendas?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearSales}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card">
          <CardHeader className="flex justify-between">
            <CardTitle>Total de PIX</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatCurrency(stats.totalPix)}
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex justify-between">
            <CardTitle>Número de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.salesCount}
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex justify-between">
            <CardTitle>Top Vendedor</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.topSeller}
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSales.length > 0 ? (
        <Card className="card">
          <CardHeader>
            <CardTitle>Últimas Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead className="text-right">PIX</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.data)}</TableCell>
                    <TableCell>{sale.seller_name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.comissao)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.pix)}
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSale(sale)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSale(sale)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="card">
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">
              Não há vendas para o período selecionado.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedSale && (
        <EditSaleDialog
          sale={selectedSale}
          isOpen={isEditModalOpen}
          onOpenChange={(open) => setIsEditModalOpen(open)}
          onSave={handleSaveSale}
          onDelete={handleDeleteSale}
          sellerOptions={sellerOptions}
        />
      )}
    </motion.div>
  );
};

export default SalesHome;
