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
  onDelete: (sale: any) => void;
  sellerOptions: string[];
}

const EditSaleDialog: React.FC<EditSaleDialogProps> = ({
  isOpen,
  onOpenChange,
  sale,
  onSave,
  onDelete,
  sellerOptions,
}) => {
  const { control, handleSubmit, reset, register } = useForm({
    defaultValues: {
      client_name: sale?.client_name || "",
      pix_value: sale?.pix_value || 0,
      commission: sale?.commission || 0,
      seller_id: sale?.seller_id || "",
      phone: sale?.phone || "",
    },
  });

  useEffect(() => {
    if (sale) {
      reset({
        client_name: sale.client_name,
        pix_value: sale.pix_value,
        commission: sale.commission,
        seller_id: sale.seller_id,
        phone: sale.phone,
      });
    }
  }, [sale, reset]);

  const onSubmit = (data: any) => {
    if (!sale) return;
    onSave({ ...sale, ...data });
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
            id="client_name"
            label="Cliente"
            isRequired
            {...register("client_name")}
            classNameContainer="w-full"
          />

          <Input.Base
            id="pix_value"
            label="PIX"
            type="number"
            isRequired
            {...register("pix_value", { valueAsNumber: true })}
            classNameContainer="w-full"
          />

          {/* Comissão */}
          <Input.Base
            id="commission"
            label="Comissão"
            type="number"
            isRequired
            {...register("commission", { valueAsNumber: true })}
            classNameContainer="w-full"
          />

          {/* Telefone / vendedor */}
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input.Phone
                id="seller_phone"
                label="Telefone do vendedor"
                isRequired
                value={field.value}
                onChange={field.onChange}
                classNameContainer="w-full"
              />
            )}
          />

          <Controller
            control={control}
            name="seller_id"
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

          <div className="flex justify-end gap-2 mt-4">
            <Button type="submit">Salvar</Button>
            <Button variant="destructive" onClick={() => onDelete(sale)}>
              Excluir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSaleDialog;
