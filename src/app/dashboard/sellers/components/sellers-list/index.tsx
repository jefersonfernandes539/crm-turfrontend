"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useDeferredValue,
} from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Loader2, Search } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import { VendedorFormData } from "../sellers-form";
import SellersForm from "../sellers-form";

interface Vendedor {
  id: string;
  name: string;
  phone?: string | null;
  photo_url?: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const SellersList: React.FC = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  const fetchVendedores = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("sellers")
      .select("*")
      .order("name", { ascending: true });

    if (deferredSearch.trim()) {
      query = query.ilike("name", `%${deferredSearch}%`);
    }

    const { data, error } = await query;

    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao buscar vendedores",
        description: error.message,
      });
    } else {
      setVendedores(data || []);
    }

    setLoading(false);
  }, [deferredSearch]);

  useEffect(() => {
    fetchVendedores();
  }, [fetchVendedores]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sellers").delete().eq("id", id);
    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao deletar vendedor",
        description: error.message,
      });
    } else {
      Toast.Base({
        title: "Vendedor deletado com sucesso!",
        description: "O vendedor foi deletado.",
        variant: "success",
      });
      fetchVendedores();
    }
  };

  const handleEdit = (vendedor: Vendedor) => {
    setEditingVendedor(vendedor);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingVendedor(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingVendedor(null);
    fetchVendedores();
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>Adicionar Vendedor</Button>
          </DialogTrigger>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {vendedores.map((vendedor) => (
              <motion.div
                key={vendedor.id}
                variants={itemVariants}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={vendedor.photo_url || ""}
                      alt={vendedor.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/assets/avatar-fallback.png";
                      }}
                    />
                    <AvatarFallback>{vendedor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--btj-text)" }}
                    >
                      {vendedor.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vendedor.phone || "Sem telefone"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${vendedor.name}`}
                    onClick={() => handleEdit(vendedor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${vendedor.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso irá deletar
                          permanentemente o vendedor.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(vendedor.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}

            {vendedores.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <p>Nenhum vendedor encontrado.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Dialog do formulário */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingVendedor ? "Editar Vendedor" : "Adicionar Novo Vendedor"}
          </DialogTitle>
        </DialogHeader>

        <SellersForm
          initialData={
            editingVendedor
              ? {
                  nome: editingVendedor.name,
                  whatsapp_e164: editingVendedor.phone || "",
                  ativo: true,
                }
              : undefined
          }
          onSubmit={async (data: VendedorFormData) => {
            const payload = {
              name: data.nome,
              phone: data.whatsapp_e164,
            };

            if (editingVendedor) {
              const { error } = await supabase
                .from("sellers")
                .update(payload)
                .eq("id", editingVendedor.id);

              if (error) {
                Toast.Base({
                  variant: "error",
                  title: "Erro ao atualizar vendedor",
                  description: error.message,
                });
              } else handleFormSuccess();
            } else {
              const { error } = await supabase.from("sellers").insert(payload);

              if (error) {
                Toast.Base({
                  variant: "error",
                  title: "Erro ao criar vendedor",
                  description: error.message,
                });
              } else handleFormSuccess();
            }
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SellersList;
