"use client";
import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  control: any;
  register: any;
  errors: any;
  pricebooks: {
    id: string;
    name: string;
    net: number;
    pricebook_id: string;
    category: string;
  }[];
  selectedOperatorId?: string;
  watch: any;
  setValue: any;
}

const ItemsForm: React.FC<Props> = ({
  control,
  register,
  pricebooks,
  selectedOperatorId,
  watch,
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Passeios / Itens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            <div className="space-y-1 md:col-span-2">
              <Label>Passeio</Label>
              <Controller
                name={`items.${index}.pricebook_id`}
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      const pb = pricebooks.find((p) => p.id === val);
                      setValue(`items.${index}.name`, pb?.name || "");
                      setValue(`items.${index}.net`, pb?.net || 0);
                      setValue(`items.${index}.category`, pb?.category || "");
                      field.onChange(val);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um passeio" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricebooks.map((pb) => (
                        <SelectItem key={pb.id} value={pb.id}>
                          {pb.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1">
              <Label>Qtd</Label>
              <Input
                type="number"
                {...register(`items.${index}.qty`, { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <Label>Data</Label>
              <Input type="date" {...register(`items.${index}.date`)} />
            </div>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {selectedOperatorId ? (
          <Button
            type="button"
            onClick={() => append({ name: "", qty: 1, net: 0, category: "" })}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar Item
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Selecione uma operadora para listar os passeios.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemsForm;
