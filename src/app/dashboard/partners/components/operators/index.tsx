"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Building,
  Hotel,
  Users,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperadoraForm, { PartnerFormData } from "../new-partner";
import { useDebounce } from "@/hooks/useDebounce";
import { PartnerItem } from "../partner-items";
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import { useRouter } from "next/navigation";
import { StatsCard } from "../stats-card";

const SkeletonItem = () => (
  <li className="flex items-center gap-4 p-4 bg-card/80 border border-border/80 rounded-lg animate-pulse">
    <div className="h-14 w-14 rounded-full bg-muted" />
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-muted rounded w-3/5" />
      <div className="h-4 bg-muted rounded w-2/5" />
    </div>
    <div className="h-9 w-9 bg-muted rounded" />
  </li>
);

const displayName = (p: any) => p.name || `Parceiro ${p.id.slice(-4)}`;

export default function Operators() {
  const [partners, setPartners] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeOperadoras: 0,
    activePousadas: 0,
    totalPartners: 0,
    tourPricebooks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"OPERADORA" | "POUSADA">(
    "OPERADORA"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOperator, setEditingOperator] =
    useState<PartnerFormData | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();

  const fetchPartners = useCallback(async (tab: "OPERADORA" | "POUSADA") => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("operators")
        .select("*")
        .eq("type", tab)
        .order("name", { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (e: any) {
      Toast.Base({
        title: "Erro ao buscar parceiros",
        description: e.message,
        variant: "error",
      });
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [
        { count: activeOperadoras },
        { count: activePousadas },
        { count: totalPartners },
        { count: tourPricebooks },
      ] = await Promise.all([
        supabase
          .from("operators")
          .select("*", { count: "exact", head: true })
          .eq("type", "OPERADORA")
          .eq("active", true),
        supabase
          .from("operators")
          .select("*", { count: "exact", head: true })
          .eq("type", "POUSADA")
          .eq("active", true),
        supabase.from("operators").select("*", { count: "exact", head: true }),
        supabase.from("pricebook").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        activeOperadoras: activeOperadoras || 0,
        activePousadas: activePousadas || 0,
        totalPartners: totalPartners || 0,
        tourPricebooks: tourPricebooks || 0,
      });
    } catch (e: any) {
      console.error("Erro ao buscar estatísticas:", e.message);
    }
  }, []);

  useEffect(() => {
    fetchPartners(activeTab);
  }, [activeTab, fetchPartners]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshData = () => {
    fetchPartners(activeTab);
    fetchStats();
  };

  const handleFormSubmit = async (formData: PartnerFormData) => {
    let error;
    if (editingOperator) {
      ({ error } = await supabase
        .from("operators")
        .update(formData)
        .eq("id", (editingOperator as any).id));
    } else {
      ({ error } = await supabase.from("operators").insert([formData]));
    }

    if (error) {
      Toast.Base({
        title: "Erro ao salvar parceiro",
        description: error.message,
        variant: "error",
      });
    } else {
      Toast.Base({
        title: "Sucesso!",
        description: `Parceiro ${
          editingOperator ? "atualizado" : "criado"
        } com sucesso!`,
        variant: "success",
      });
      setEditingOperator(null);
      setIsDialogOpen(false);
      refreshData();
    }
  };

  const handleEdit = (operator: any) => {
    setEditingOperator(operator);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("operators").delete().eq("id", id);
    if (error) {
      Toast.Base({
        title: "Erro ao excluir",
        description:
          "Verifique se o parceiro não está associado a outros registros.",
        variant: "error",
      });
    } else {
      Toast.Base({
        title: "Sucesso!",
        description: "Parceiro excluído com sucesso.",
        variant: "success",
      });
      refreshData();
    }
  };

  const handleToggleStatus = async (operator: any) => {
    const { error } = await supabase
      .from("operators")
      .update({ active: !operator.active })
      .eq("id", operator.id);
    if (error) {
      Toast.Base({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "error",
      });
    } else {
      Toast.Base({
        title: "Sucesso!",
        description: "Status do parceiro atualizado.",
        variant: "success",
      });
      refreshData();
    }
  };

  const handleUploadPhoto = async (file: File, partnerId: string) => {
    try {
      const { uploadPartnerPhoto } = await import(
        "@/utils/lib/helpers/storage"
      );
      const photo_url = await uploadPartnerPhoto(file, partnerId);

      const { error } = await supabase
        .from("operators")
        .update({ photo_url })
        .eq("id", partnerId);
      if (error) throw error;

      Toast.Base({
        title: "Foto atualizada com sucesso!",
        description: "a foto foi atualizada com sucesso.",
        variant: "success",
      });
      refreshData();
    } catch (error: any) {
      Toast.Base({
        title: "Erro ao enviar foto",
        description: error.message,
        variant: "error",
      });
    }
  };

  const handleViewPasseios = (partnerId: string) => {
    router.push(`/dashboard/partners/details/${partnerId}`);
  };

  const filteredPartners = partners.filter((p) =>
    displayName(p).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <ul className="space-y-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </ul>
      );
    }
    if (filteredPartners.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground bg-card/50 rounded-lg mt-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum parceiro encontrado
          </h3>
          <p className="mt-1 text-sm">
            Ajuste os termos da busca ou adicione um novo parceiro.
          </p>
        </div>
      );
    }
    return (
      <motion.ul initial="hidden" animate="visible" className="space-y-3 mt-4">
        {filteredPartners.map((op) => (
          <PartnerItem
            key={op.id}
            partner={op}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onUploadPhoto={handleUploadPhoto}
            onViewPasseios={handleViewPasseios}
          />
        ))}
      </motion.ul>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold hologram-text">Parceiros</h1>
            <p className="text-muted-foreground">
              Gerencie suas operadoras e pousadas parceiras.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingOperator(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Parceiro
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 chip"
          />
        </motion.div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="OPERADORA">Operadoras</TabsTrigger>
            <TabsTrigger value="POUSADA">Pousadas</TabsTrigger>
          </TabsList>
          <TabsContent value="OPERADORA">{renderContent()}</TabsContent>
          <TabsContent value="POUSADA">{renderContent()}</TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatsCard
            icon={Building}
            title="Operadoras Ativas"
            value={stats.activeOperadoras}
            color="text-green-400"
          />
          <StatsCard
            icon={Hotel}
            title="Pousadas Ativas"
            value={stats.activePousadas}
            color="text-blue-400"
          />
          <StatsCard
            icon={Users}
            title="Total de Parceiros"
            value={stats.totalPartners}
          />
          <StatsCard
            icon={Tag}
            title="Tarifas de Passeios"
            value={stats.tourPricebooks}
          />
        </motion.div>
      </div>

      <OperadoraForm
        open={isDialogOpen}
        onClose={() => {
          setEditingOperator(null);
          setIsDialogOpen(false);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingOperator}
      />
    </>
  );
}
