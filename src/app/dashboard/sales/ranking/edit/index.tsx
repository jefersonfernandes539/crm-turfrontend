"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toast } from "@/components";
import { canonical } from "@/utils/lib/canonical";

interface Sale {
  id?: string;
  cliente?: string;
  data?: string;
  vendedor?: string;
  pix?: number;
  comissao?: number;
}

interface EditSaleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSave: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  sellerOptions?: string[];
}

const EditSaleDialog: React.FC<EditSaleDialogProps> = ({
  isOpen,
  onOpenChange,
  sale: initialSale,
  onSave,
  onDelete,
  sellerOptions = [],
}) => {
  const [sale, setSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (initialSale) setSale(structuredClone(initialSale));
  }, [initialSale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSale((prev) => ({ ...prev!, [name]: value }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue =
      parseFloat(value.replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
    setSale((prev) => ({ ...prev!, [name]: numericValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSale((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSave = () => {
    if (!sale) return;
    const normalizedSeller = canonical(sale.vendedor, sellerOptions);
    if (!normalizedSeller) {
      Toast.Base({
        variant: "error",
        title: "Vendedor não permitido",
        description:
          "Use um da lista ou adicione manualmente na página de Vendedores.",
      });
      return;
    }
    onSave({ ...sale, vendedor: normalizedSeller });
    Toast.Base({
      title: "Venda atualizada com sucesso!",
      variant: "success",
      description: "",
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!sale) return;
    onDelete(sale);
    Toast.Base({
      variant: "error",
      title: "Venda excluída com sucesso!",
      description: "",
    });
    onOpenChange(false);
  };

  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da venda. Clique em salvar para aplicar as
            alterações.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cliente" className="text-right">
              Cliente
            </Label>
            <Input
              id="cliente"
              name="cliente"
              value={sale.cliente}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data" className="text-right">
              Data
            </Label>
            <Input
              id="data"
              name="data"
              type="date"
              value={sale.data}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vendedor" className="text-right">
              Vendedor
            </Label>
            <Select
              value={sale.vendedor}
              onValueChange={(value) => handleSelectChange("vendedor", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {sellerOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pix" className="text-right">
              Valor PIX
            </Label>
            <Input
              id="pix"
              name="pix"
              value={new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
              }).format(sale.pix || 0)}
              onChange={handleCurrencyChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comissao" className="text-right">
              Comissão
            </Label>
            <Input
              id="comissao"
              name="comissao"
              value={new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
              }).format(sale.comissao || 0)}
              onChange={handleCurrencyChange}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="btn">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta venda? Esta ação não pode
                  ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleSave} className="btn btn-primary">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSaleDialog;
