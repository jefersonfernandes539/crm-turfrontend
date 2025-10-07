"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReservationFormValues } from "@/utils/lib/schemas/reservation-schema";
import { Loader2 } from "lucide-react";

interface VoucherFormProps {
  initialData: ReservationFormValues;
  onSubmit?: (data: ReservationFormValues) => void;
  isSaving?: boolean;
}

export function FormResevation({
  initialData,
  onSubmit,
  isSaving = false,
}: VoucherFormProps) {
  const [formData, setFormData] = useState<ReservationFormValues>(initialData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: "items" | "passengers" | "reservation",
    index?: number,
    field?: string
  ) => {
    if (section === "reservation") {
      setFormData((prev) => ({ ...prev, [field!]: e.target.value }));
    } else if (section === "passengers" && index !== undefined) {
      setFormData((prev) => {
        const updated = [...prev.passengers];
        updated[index] = { ...updated[index], [field!]: e.target.value };
        return { ...prev, passengers: updated };
      });
    } else if (section === "items" && index !== undefined) {
      setFormData((prev) => {
        const updated = [...prev.items];
        updated[index] = { ...updated[index], [field!]: e.target.value };
        return { ...prev, items: updated };
      });
    }
  };

  const handleCheckboxChange = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.passengers];
      updated[index].is_infant = !updated[index].is_infant;
      return { ...prev, passengers: updated };
    });
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData);
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Dados da Reserva */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input value={formData.code} readOnly />
        </div>
        <div>
          <Label>Contratante</Label>
          <Input
            value={formData.contractor_name}
            onChange={(e) =>
              handleChange(e, "reservation", undefined, "contractor_name")
            }
          />
        </div>
        <div>
          <Label>Embarque</Label>
          <Input
            value={formData.embark_place}
            onChange={(e) =>
              handleChange(e, "reservation", undefined, "embark_place")
            }
          />
        </div>
        <div>
          <Label>Data</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange(e, "reservation", undefined, "date")}
          />
        </div>
        <div>
          <Label>Entrada</Label>
          <Input
            type="number"
            value={formData.entry_value}
            onChange={(e) =>
              handleChange(e, "reservation", undefined, "entry_value")
            }
          />
        </div>
        <div>
          <Label>Total</Label>
          <Input type="number" value={formData.total_items_net} readOnly />
        </div>
      </div>

      {/* Passageiros */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Passageiros</h3>
        {formData.passengers.map((p, idx) => (
          <div key={p.id || idx} className="grid grid-cols-3 gap-4 mb-2">
            <div>
              <Label>Nome</Label>
              <Input
                value={p.name}
                onChange={(e) => handleChange(e, "passengers", idx, "name")}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={p.phone}
                onChange={(e) => handleChange(e, "passengers", idx, "phone")}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Criança no colo</Label>
              <Input
                type="checkbox"
                checked={p.is_infant}
                onChange={() => handleCheckboxChange(idx)}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Itens</h3>
        {formData.items.map((item, idx) => (
          <div key={item.id || idx} className="grid grid-cols-4 gap-4 mb-2">
            <div>
              <Label>Descrição</Label>
              <Input
                value={item.name}
                onChange={(e) => handleChange(e, "items", idx, "name")}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                value={item.category}
                onChange={(e) => handleChange(e, "items", idx, "category")}
              />
            </div>
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={item.date}
                onChange={(e) => handleChange(e, "items", idx, "date")}
              />
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleChange(e, "items", idx, "quantity")}
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="button" onClick={handleSubmit} disabled={isSaving}>
        {isSaving && (
          <Loader2 className="h-4 w-4 animate-spin mr-2 inline-block" />
        )}
        Salvar Voucher
      </Button>
    </form>
  );
}
