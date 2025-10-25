"use client";

import React, { useEffect } from "react";
import {
  Control,
  UseFormRegister,
  useFieldArray,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReservationFormValues } from "@/utils/lib/schemas/reservation-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const items = watch("items");

  useEffect(() => {
    let total = 0;

    items.forEach((item, i) => {
      const subtotal = item.net * item.quantity;
      setValue(`items.${i}.subtotal`, subtotal);
      total += subtotal;
    });

    setValue("total_items_net", total);
    setValue("remaining", total - watch("entry_value"));
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

            <div>
              <Label>Data</Label>
              <Input type="date" {...register(`items.${index}.date`)} />
            </div>

            <div>
              <Label>Qtd</Label>
              <Input
                type="number"
                min={1}
                {...register(`items.${index}.quantity`, {
                  valueAsNumber: true,
                })}
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
                  value={items[index]?.subtotal || 0}
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
