"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
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
import { parseExcelDate } from "@/utils/formatters/duplicateVoucher";

const PAGE_SIZE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [sellerOptions, setSellerOptions] = useState<string[]>([]);

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
  }, []);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("spreadsheet_sales")
      .select("*");
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
      await fetchSellers();
      await fetchSales();
    };
    loadData();

    const channel = supabase
      .channel("spreadsheet_sales")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spreadsheet_sales" },
        () => fetchSales()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSales, fetchSellers]);

  useEffect(() => {
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
        vendedor: s.vendedor,
        comissao: s.comissao,
      }))
    ).sort((a, b) => b.total - a.total);

    const topSeller = ranking.length > 0 ? ranking[0].vendedor : "N/A";

    setStats({ totalPix, salesCount, topSeller });

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setFilteredSales(currentFilteredSales.slice(startIndex, endIndex));
  }, [allSales, currentMonth, currentYear, currentPage]);

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
    if (error)
      Toast.Base({
        variant: "error",
        title: "Erro ao salvar venda",
        description: error.message,
      });
    else {
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
    if (error)
      Toast.Base({
        variant: "error",
        title: "Erro ao excluir venda",
        description: error.message,
      });
    else {
      Toast.Base({
        variant: "success",
        title: "Venda excluída!",
        description: "",
      });
      fetchSales();
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        Toast.Base({
          variant: "error",
          title: "Usuário não logado",
          description: "Você precisa estar logado para importar vendas.",
        });
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet =
        workbook.Sheets["Vendas"] || workbook.Sheets[workbook.SheetNames[0]];

      const parsed: any[] = XLSX.utils.sheet_to_json(sheet, {
        header: [
          "cliente",
          "estado",
          "data",
          "vendedor",
          "comissao",
          "pix",
          "tipo",
          "conta",
        ],
        range: 3,
        defval: "",
      });

      const currentYear = new Date().getFullYear();

      const mapped = parsed
        .filter((row) => row.cliente && row.cliente !== "Nome Cliente") // remove linha de cabeçalho
        .map((row) => {
          const parsedData = row.data
            ? (() => {
                const d = row.data;

                if (d instanceof Date && !isNaN(d.getTime())) {
                  return d.toISOString().split("T")[0];
                }

                if (typeof d === "string") {
                  const parts = d.split("/");
                  if (parts.length === 2) {
                    const [day, month] = parts;
                    return `${currentYear}-${month.padStart(
                      2,
                      "0"
                    )}-${day.padStart(2, "0")}`;
                  }
                  if (parts.length === 3) {
                    const [day, month, year] = parts;
                    return `${year}-${month.padStart(2, "0")}-${day.padStart(
                      2,
                      "0"
                    )}`;
                  }
                }

                if (typeof d === "number") {
                  const date = XLSX.SSF.parse_date_code(d);
                  if (date) {
                    const yyyy = date.y;
                    const mm = String(date.m).padStart(2, "0");
                    const dd = String(date.d).padStart(2, "0");
                    return `${yyyy}-${mm}-${dd}`;
                  }
                }

                return null;
              })()
            : null;

          return {
            id: uuidv4(),
            cliente: row.cliente,
            estado: row.estado,
            data: parsedData,
            vendedor: row.vendedor,
            comissao:
              parseFloat(
                String(row.comissao || "0")
                  .replace("R$", "")
                  .replace(/\./g, "")
                  .replace(",", ".")
              ) || 0,
            pix:
              parseFloat(
                String(row.pix || "0")
                  .replace("R$", "")
                  .replace(/\./g, "")
                  .replace(",", ".")
              ) || 0,
            tipo: row.tipo,
            conta: row.conta,
            user_id: userId,
            created_at: new Date().toISOString(),
          };
        });

      const { error } = await supabase.from("spreadsheet_sales").insert(mapped);
      if (error) throw error;

      Toast.Base({
        variant: "success",
        title: "Importação concluída",
        description: "As vendas foram importadas com sucesso!",
      });
    } catch (err: any) {
      console.error(err);
      Toast.Base({
        variant: "error",
        title: "Erro ao importar",
        description: err.message || "Ocorreu um erro inesperado.",
      });
    }
  };

  const handleClearSales = async () => {
    try {
      await supabase.from("spreadsheet_sales").delete();
      Toast.Base({
        variant: "success",
        title: "Vendas limpas!",
        description: "",
      });
      fetchSales();
    } catch (err: any) {
      Toast.Base({
        variant: "error",
        title: "Erro ao limpar",
        description: err.message,
      });
    }
  };
  useEffect(() => {
    console.log("Todos os registros:", allSales);
    const currentFilteredSales = allSales.filter((sale) =>
      inPer(sale.data, currentMonth, currentYear)
    );
    console.log("Filtrados para o mês/ano:", currentFilteredSales);
  }, [allSales, currentMonth, currentYear]);

  const totalPages = Math.ceil(
    allSales.filter((sale) => inPer(sale.data, currentMonth, currentYear))
      .length / PAGE_SIZE
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight hologram-text">
          Dashboard de Vendas
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={currentMonth.toString()}
            onValueChange={(val) => {
              setCurrentMonth(Number(val));
              setCurrentPage(1);
            }}
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
            onValueChange={(val) => {
              setCurrentYear(Number(val));
              setCurrentPage(1);
            }}
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead className="text-right">PIX</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.data)}</TableCell>
                    <TableCell>{sale.vendedor}</TableCell>
                    <TableCell>{sale.cliente}</TableCell>
                    <TableCell>{sale.estado}</TableCell>
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

            <div className="flex justify-end gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center gap-2">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
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
          onOpenChange={setIsEditModalOpen}
          onSave={handleSaveSale}
          sellerOptions={sellerOptions}
          estadoOptions={[
            "AC",
            "AL",
            "AP",
            "AM",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MT",
            "MS",
            "MG",
            "PA",
            "PB",
            "PR",
            "PE",
            "PI",
            "RJ",
            "RN",
            "RS",
            "RO",
            "RR",
            "SC",
            "SP",
            "SE",
            "TO",
          ]}
        />
      )}
    </motion.div>
  );
};

export default SalesHome;
