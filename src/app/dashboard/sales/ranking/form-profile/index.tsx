"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/stores/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign,
  ShoppingCart,
  Percent,
  Loader2,
  Camera,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import { inPer } from "@/utils/lib/xlsx-utils";
import { getSellerOptions } from "@/utils/lib/sellers";
import { formatCurrency, formatDate } from "@/utils/lib/helpers/formatCurrency";
import EditSaleDialog from "../edit";

const StatCard = ({ title, value, icon: Icon }: any) => (
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

interface SellerProfileProps {
  slug: string;
}

const SellerProfile: React.FC<SellerProfileProps> = ({ slug }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [seller, setSeller] = useState<any>(null);
  const [sellerData, setSellerData] = useState<any>(null);
  const [allSales, setAllSales] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [sellerOptions, setSellerOptions] = useState<string[]>([]);

  const selMonth = useMemo(
    () => parseInt(searchParams.get("m") || "0", 10),
    [searchParams]
  );
  const selYear = useMemo(
    () => parseInt(searchParams.get("y") || "0", 10),
    [searchParams]
  );

  const getSlug = (name: string) =>
    (name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, "");

  const findSellerBySlug = useCallback(async (sellerName: string) => {
    if (!sellerName) return null;

    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("name", sellerName)
      .single();

    if (error && error.code !== "PGRST116") {
      Toast.Base({
        variant: "error",
        title: "Erro ao buscar vendedor",
        description: error.message,
      });
      return null;
    }
    if (data) return data;

    const { data: newSeller, error: upsertError } = await supabase
      .from("sellers")
      .upsert({ name: sellerName, active: true }, { onConflict: "name" })
      .select()
      .single();

    if (upsertError) {
      Toast.Base({
        variant: "error",
        title: "Erro ao criar vendedor",
        description: upsertError.message,
      });
      return null;
    }
    return newSeller;
  }, []);

  const calculateStats = useCallback(
    (salesData: any[], sellerName: string) => {
      const sellerSales = salesData.filter((s) => s.vendedor === sellerName);
      const periodSales = sellerSales.filter((s) =>
        inPer(s.data, selMonth, selYear)
      );

      setSeller({
        name: sellerName,
        totalCommission: periodSales.reduce(
          (acc, s) => acc + Number(s.comissao || 0),
          0
        ),
        totalPix: periodSales.reduce((acc, s) => acc + Number(s.pix || 0), 0),
        salesCount: periodSales.length,
      });
      setSales(
        periodSales.sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        )
      );
    },
    [selMonth, selYear]
  );

  const fetchSales = useCallback(async () => {
    if (!user) return [];
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
      return [];
    }
    return data || [];
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const options = await getSellerOptions();
      setSellerOptions(options);

      const localSales = await fetchSales();
      setAllSales(localSales);

      const sellerNameFromSlug = options.find(
        (name: any) => getSlug(name) === slug
      );
      if (!sellerNameFromSlug) {
        Toast.Base({
          variant: "error",
          title: "Vendedor não encontrado.",
          description: "",
        });
        setLoading(false);
        return;
      }

      const foundSeller = await findSellerBySlug(sellerNameFromSlug);
      if (!foundSeller) {
        setLoading(false);
        return;
      }
      setSellerData(foundSeller);
      calculateStats(localSales, foundSeller.name);
      setLoading(false);
    };
    fetchData();
  }, [slug, findSellerBySlug, calculateStats, fetchSales]);

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !sellerData) return;

    setIsUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${sellerData.id}-${Date.now()}.${fileExt}`;
    const filePath = `sellers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("vouchers")
      .upload(filePath, file);
    if (uploadError) {
      Toast.Base({
        variant: "error",
        title: "Erro no upload",
        description: uploadError.message,
      });
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } = { publicUrl: "" } } = supabase.storage
      .from("vouchers")
      .getPublicUrl(filePath);
    const { error: updateError } = await supabase
      .from("sellers")
      .update({ photo_url: publicUrl })
      .eq("id", sellerData.id);

    if (updateError) {
      Toast.Base({
        variant: "error",
        title: "Erro ao salvar URL",
        description: updateError.message,
      });
    } else {
      setSellerData((prev: any) => ({ ...prev, photo_url: publicUrl }));
      Toast.Base({
        title: "Foto atualizada com sucesso!",
        variant: "success",
        description: "",
      });
    }
    setIsUploading(false);
  };

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
      const updatedSales = allSales.map((s) =>
        s.id === updatedSale.id ? updatedSale : s
      );
      setAllSales(updatedSales);
      calculateStats(updatedSales, seller.name);
      Toast.Base({
        title: "Venda atualizada com sucesso!",
        variant: "success",
        description: "",
      });
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
      const updatedSales = allSales.filter((s) => s.id !== saleToDelete.id);
      setAllSales(updatedSales);
      calculateStats(updatedSales, seller.name);
      Toast.Base({
        variant: "error",
        title: "Venda excluída com sucesso!",
        description: "",
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );

  if (!seller)
    return (
      <div className="text-center text-muted-foreground">
        Vendedor não encontrado ou sem vendas no período.
      </div>
    );

  return (
    <div className="space-y-6">
      <button
        onClick={() =>
          router.push(`/dashboard/sales/ranking?m=${selMonth}&y=${selYear}`)
        }
        className="inline-flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o Ranking
      </button>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <Avatar className="w-32 h-32 border-4 border-primary/70">
            <AvatarImage
              src={sellerData?.photo_url || "/assets/avatar-fallback.png"}
              onError={(e: any) =>
                (e.currentTarget.src = "/assets/avatar-fallback.png")
              }
              alt={seller.name}
            />
            <AvatarFallback className="text-4xl">
              {seller.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="photo-upload"
            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
            <input
              id="photo-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight hologram-text">
            {seller.name}
          </h1>
          <p className="text-muted-foreground">
            Desempenho de vendas para{" "}
            {new Date(selYear, selMonth).toLocaleString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Comissão"
          value={formatCurrency(seller.totalCommission)}
          icon={DollarSign}
        />
        <StatCard
          title="Total PIX"
          value={formatCurrency(seller.totalPix)}
          icon={Percent}
        />
        <StatCard
          title="Qtd. Vendas"
          value={seller.salesCount}
          icon={ShoppingCart}
        />
      </div>

      <Card className="card">
        <CardHeader>
          <CardTitle>Vendas Realizadas no Período</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">PIX</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale, index) => (
                  <TableRow
                    key={sale.id || index}
                    onClick={() => handleEditSale(sale)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      {sale.cliente || "-"} {sale.estado && `- ${sale.estado}`}
                    </TableCell>
                    <TableCell>{formatDate(sale.data)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.pix)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.comissao)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma venda encontrada para este vendedor no período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditSaleDialog
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        sale={selectedSale}
        onSave={handleSaveSale}
        onDelete={handleDeleteSale}
        sellerOptions={sellerOptions}
      />
    </div>
  );
};

export default SellerProfile;
