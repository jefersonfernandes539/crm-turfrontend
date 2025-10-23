"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components";

interface EditSaleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: any;
  onSave: (sale: any) => void;
  sellerOptions: string[];
  estadoOptions: string[];
}

const EditSaleDialog: React.FC<EditSaleDialogProps> = ({
  isOpen,
  onOpenChange,
  sale,
  onSave,
  sellerOptions,
  estadoOptions,
}) => {
  const { control, handleSubmit, reset, register } = useForm({
    defaultValues: {
      cliente: sale?.cliente || "",
      pix: sale?.pix || 0,
      comissao: sale?.comissao || 0,
      vendedor: sale?.vendedor || "",
      estado: sale?.estado || "",
    },
  });

  useEffect(() => {
    if (sale) {
      reset({
        cliente: sale.cliente || "",
        pix: sale.pix || 0,
        comissao: sale.comissao || 0,
        vendedor: sale.vendedor || "",
        estado: sale.estado || "",
      });
    }
  }, [sale, reset]);

  const onSubmit = (data: any) => {
    if (!sale) return;
    onSave({ ...sale, ...data });
    onOpenChange(false);
  };

  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input.Base
            id="cliente"
            label="Cliente"
            isRequired
            {...register("cliente")}
            classNameContainer="w-full"
          />

          <Input.Base
            id="pix"
            label="Valor PIX"
            type="number"
            isRequired
            {...register("pix", { valueAsNumber: true })}
            classNameContainer="w-full"
          />

          <Input.Base
            id="comissao"
            label="Comissão"
            type="number"
            isRequired
            {...register("comissao", { valueAsNumber: true })}
            classNameContainer="w-full"
          />

          <Controller
            control={control}
            name="vendedor"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellerOptions.map((seller) => (
                    <SelectItem key={seller} value={seller}>
                      {seller}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {(estadoOptions ?? []).map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="submit">Salvar</Button>
            <Button
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSaleDialog;
