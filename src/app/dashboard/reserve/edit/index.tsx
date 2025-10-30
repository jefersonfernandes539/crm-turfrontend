"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ReservationFormValues } from "@/utils/lib/schemas/reservation-schema";
import { getSellerOptions } from "@/utils/lib/sellers";

interface EditVoucherDialogProps {
  reservationData: ReservationFormValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedData: ReservationFormValues) => Promise<void>;
}

interface ItemOption {
  id: string;
  name: string;
}

export function EditVoucherDialog({
  reservationData,
  open,
  onOpenChange,
  onSave,
}: EditVoucherDialogProps) {
  const [formData, setFormData] =
    useState<ReservationFormValues>(reservationData);
  const [sellerOptions, setSellerOptions] = useState<string[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [descriptionOptions, setDescriptionOptions] = useState<ItemOption[]>([]);

  const loadDescriptionOptions = useCallback(() => {
    const options: ItemOption[] = formData.items.map((i, idx) => ({
      id: i.id ?? `item-${idx}`,
      name: i.name,
    }));
    setDescriptionOptions(options);
  }, [formData.items]);

  const fetchSellers = useCallback(async () => {
    setLoadingSellers(true);
    const sellers = await getSellerOptions();
    setSellerOptions(sellers);
    setLoadingSellers(false);
  }, []);

  useEffect(() => {
    setFormData(reservationData);
    fetchSellers();
    loadDescriptionOptions();
  }, [reservationData, fetchSellers, loadDescriptionOptions]);

  const handleChange = (field: keyof ReservationFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePassengerChange = (
    index: number,
    field: keyof (typeof formData.passengers)[0],
    value: any
  ) => {
    const updated = [...formData.passengers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, passengers: updated }));
  };

  const handleItemChange = (
    index: number,
    field: keyof (typeof formData.items)[0],
    value: any
  ) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleSaveClick = async () => {
    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-6">
        <DialogHeader>
          <DialogTitle>Editar Voucher - {formData.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4 max-h-[80vh] overflow-y-auto pr-2">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <Label>Vendedor</Label>
              <Select
                value={formData.seller_id}
                onValueChange={(val) => handleChange("seller_id", val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {loadingSellers ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : (
                    sellerOptions.map((seller) => (
                      <SelectItem key={seller} value={seller}>
                        {seller}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <Label>Contratante</Label>
              <Input
                className="mt-1"
                value={formData.contractor_name}
                onChange={(e) =>
                  handleChange("contractor_name", e.target.value)
                }
              />
            </div>

            <div className="flex flex-col">
              <Label>Embarque</Label>
              <Input
                className="mt-1"
                value={formData.embark_place}
                onChange={(e) => handleChange("embark_place", e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <Label>Data</Label>
              <Input
                className="mt-1"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <Label>Entrada</Label>
              <Input
                className="mt-1"
                type="number"
                value={formData.entry_value}
                onChange={(e) =>
                  handleChange("entry_value", Number(e.target.value))
                }
              />
            </div>

            <div className="flex flex-col">
              <Label>Total</Label>
              <Input
                className="mt-1"
                type="number"
                value={formData.total_items_net}
                readOnly
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Passageiros</h3>
            {formData.passengers.map((p, idx) => (
              <div key={p.id} className="grid grid-cols-3 gap-4 mb-2">
                <div className="flex flex-col">
                  <Label>Nome</Label>
                  <Input
                    className="mt-1"
                    value={p.name ?? ""}
                    onChange={(e) =>
                      handlePassengerChange(idx, "name", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Telefone</Label>
                  <Input
                    className="mt-1"
                    value={p.phone ?? ""}
                    onChange={(e) =>
                      handlePassengerChange(idx, "phone", e.target.value)
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Label>Criança no colo</Label>
                  <Input
                    type="checkbox"
                    checked={p.is_infant}
                    onChange={() =>
                      handlePassengerChange(idx, "is_infant", !p.is_infant)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2">Itens</h3>
            {formData.items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-2 gap-4 mb-2">
                <div className="flex flex-col">
                  <Label>Descrição</Label>
                  <Select
                    value={item.name}
                    onValueChange={(val) => handleItemChange(idx, "name", val)}
                  >
                    <SelectTrigger className="mt-1 h-10">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {descriptionOptions.map((desc) => (
                        <SelectItem key={desc.id} value={desc.name}>
                          {desc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col">
                  <Label>Categoria</Label>
                  <Input
                    className="mt-1 h-10"
                    value={item.category}
                    onChange={(e) =>
                      handleItemChange(idx, "category", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <Label>Data</Label>
                  <Input
                    className="mt-1 h-10"
                    type="date"
                    value={item.date}
                    onChange={(e) =>
                      handleItemChange(idx, "date", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <Label>Quantidade</Label>
                  <Input
                    className="mt-1 h-10"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", Number(e.target.value))
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <Label>Net</Label>
                  <Input
                    className="mt-1 h-10"
                    type="number"
                    value={item.net}
                    onChange={(e) =>
                      handleItemChange(idx, "net", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleSaveClick}
            disabled={loadingSellers}
            className="mt-4"
          >
            {loadingSellers && (
              <Loader2 className="h-4 w-4 animate-spin mr-2 inline-block" />
            )}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
