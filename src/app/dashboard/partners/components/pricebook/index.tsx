"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Toast } from "@/components";
import eventBus from "@/utils/lib/helpers/eventBus";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";

interface PricebookItem {
  id: string;
  name: string;
  net: number;
}

interface FormData {
  name: string;
  net: string;
}

interface PricebookProps {
  partnerId: string;
}

const Pricebook: React.FC<PricebookProps> = ({ partnerId }) => {
  const router = useRouter();

  const [partner, setPartner] = useState<{ id: string; name: string } | null>(
    null
  );
  const [pricebook, setPricebook] = useState<PricebookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricebookItem | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: "", net: "" });
  const [saving, setSaving] = useState(false);

  const fetchPricebook = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: partnerData } = await supabase
        .from("operators")
        .select("id, name")
        .eq("id", partnerId)
        .single();

      setPartner(partnerData);

      const { data, error } = await supabase
        .from("pricebook")
        .select("*")
        .eq("partner_id", partnerId)
        .order("name", { ascending: true });

      if (error) {
        Toast.Base({
          variant: "error",
          title: "Erro",
          description: error.message,
        });
      } else {
        setPricebook(data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar pricebook:", err);
      Toast.Base({
        variant: "error",
        title: "Erro",
        description: "Não foi possível carregar os dados.",
      });
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchPricebook();
  }, [fetchPricebook]);

  const openModal = (item: PricebookItem | null = null) => {
    setEditingItem(item);
    setFormData({ name: item?.name || "", net: item?.net.toString() || "" });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.net === "" || isNaN(Number(formData.net))) {
      Toast.Base({
        variant: "error",
        title: "Campos obrigatórios",
        description: "Nome e um valor NET válido são necessários.",
      });
      return;
    }

    setSaving(true);

    const dataToSave = {
      partner_id: partnerId,
      name: formData.name,
      net: Number(formData.net),
    };

    let error;

    if (editingItem) {
      ({ error } = await supabase
        .from("pricebook")
        .update(dataToSave)
        .eq("id", editingItem.id));
    } else {
      ({ error } = await supabase.from("pricebook").insert(dataToSave));
    }

    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao salvar",
        description: error.message,
      });
    } else {
      Toast.Base({
        variant: "success",
        title: "Sucesso!",
        description: `Passeio ${editingItem ? "atualizado" : "adicionado"}.`,
      });
      setIsModalOpen(false);
      fetchPricebook();
      eventBus.emit("pricebook:updated", partnerId);
    }

    setSaving(false);
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) return;

    const { error } = await supabase
      .from("pricebook")
      .delete()
      .eq("id", itemId);

    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao excluir",
        description: error.message,
      });
    } else {
      Toast.Base({
        variant: "success",
        title: "Item excluído",
        description: "O item foi excluído com sucesso.",
      });
      fetchPricebook();
      eventBus.emit("pricebook:updated", partnerId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => router.push("/dashboard/partners")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Parceiros
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Passeios de {partner?.name}
          </h1>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Passeio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Passeios</CardTitle>
          <CardDescription>
            Valores NET para cada passeio oferecido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>NET (R$)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricebook.length ? (
                  pricebook.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{formatCurrency(item.net * 100)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openModal(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      Nenhum passeio cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Passeio" : "Adicionar Passeio"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="net" className="text-right">
                NET (R$)
              </Label>
              <Input
                id="net"
                type="number"
                value={formData.net}
                onChange={(e) =>
                  setFormData({ ...formData, net: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Pricebook;
