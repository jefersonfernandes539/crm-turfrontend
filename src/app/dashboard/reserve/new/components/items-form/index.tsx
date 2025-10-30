"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReservationFormValues } from "@/utils/lib/schemas/reservation-schema";
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

interface ItemsFormProps {
  control: Control<ReservationFormValues>;
  register: UseFormRegister<ReservationFormValues>;
  watch: UseFormWatch<ReservationFormValues>;
  setValue: UseFormSetValue<ReservationFormValues>;
  errors: FieldErrors<ReservationFormValues>;
  pricebooks: { id: string; name: string; net: number; category: string }[];
  selectedOperatorId?: string;
}

const ItemsForm: React.FC<ItemsFormProps> = ({
  control,
  register,
  watch,
  setValue,
  errors,
  pricebooks,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = useMemo(() => watch("items") || [], [watch]);

  useEffect(() => {
    let total = 0;
    items.forEach((item, i) => {
      const subtotal = (item.quantity || 0) * (item.net || 0);
      setValue(`items.${i}.subtotal`, subtotal);
      total += subtotal;
    });
    setValue("total_items_net", total);
    setValue("remaining", total - (watch("entry_value") || 0));
  }, [items, setValue, watch]);


  const handleAddItem = () => {
    append({
      pricebook_id: "",
      name: "",
      category: "",
      date: "",
      quantity: 1,
      net: 0,
      transfer_multiplier: 1,
      subtotal: 0,
    });
  };

  const handleSelectPricebook = (index: number, pricebookId: string) => {
    const selected = pricebooks.find((p) => p.id === pricebookId);
    if (!selected) return;
    setValue(`items.${index}.pricebook_id`, selected.id);
    setValue(`items.${index}.name`, selected.name);
    setValue(`items.${index}.category`, selected.category);
    setValue(`items.${index}.net`, selected.net);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Itens da Reserva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border-b pb-4"
          >
            <div className="md:col-span-2">
              <Label>Item</Label>
              <Select
                onValueChange={(value) => handleSelectPricebook(index, value)}
                value={items[index]?.pricebook_id || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent>
                  {pricebooks.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.items?.[index]?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.items[index]?.name?.message as string}
                </p>
              )}
            </div>

            <div className="col-span-full sm:col-span-2 md:col-span-2 lg:col-span-1 space-y-1">
              <Label>Data</Label>
              <Input type="date" {...register(`items.${index}.date`)} className="w-full" />
            </div>

            <div>
              <Label>Qtd</Label>
              <Input
                type="number"
                min={1}
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label>Net</Label>
              <Input
                type="number"
                step="0.01"
                {...register(`items.${index}.net`, { valueAsNumber: true })}
              />
            </div>

            <div className="flex justify-center items-center">
              <div>
                <Label>Subtotal</Label>
                <Input
                  type="number"
                  {...register(`items.${index}.subtotal`, { valueAsNumber: true })}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div className="mt-4 pl-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={handleAddItem}
          className="mt-4"
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </CardContent>
    </Card>
  );
};

export default ItemsForm;
