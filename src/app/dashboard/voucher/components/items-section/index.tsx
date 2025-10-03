"use client";

import type {
  Control,
  FieldErrors,
  UseFieldArrayReturn,
} from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import type { VoucherFormData, PricebookItem } from "@/types/Voucher";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";

interface ItemsSectionProps {
  register: any;
  control: Control<VoucherFormData>;
  errors: FieldErrors<VoucherFormData>;
  itemFields: UseFieldArrayReturn<VoucherFormData, "itens", "id">["fields"];
  appendItem: UseFieldArrayReturn<VoucherFormData, "itens", "id">["append"];
  removeItem: UseFieldArrayReturn<VoucherFormData, "itens", "id">["remove"];
  pricebook: PricebookItem[];
  selectedOperatorId: string;
}

export function ItemsSection({
  register,
  control,
  errors,
  itemFields,
  appendItem,
  removeItem,
  pricebook,
  selectedOperatorId,
}: ItemsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Itens do Voucher</CardTitle>
          <CardDescription>
            Detalhes dos passeios, transfers ou serviços.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendItem({
              descricao: "",
              data: "",
              hora: "",
              observacoes: "",
            })
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {itemFields.map((field, index) => (
          <div
            key={field.id}
            className="grid md:grid-cols-10 gap-3 p-3 border rounded-md items-end bg-background/50"
          >
            <div className="md:col-span-4 space-y-1">
              <Label>Descrição *</Label>
              <Controller
                name={`itens.${index}.descricao`}
                control={control}
                rules={{ required: "Descrição do item é obrigatória" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedOperatorId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedOperatorId
                            ? "Selecione uma operadora"
                            : "Selecione um passeio..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {pricebook.map((p) => (
                        <SelectItem key={p.name} value={p.name}>
                          {p.name} ({formatCurrency(p.net)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.itens?.[index]?.descricao && (
                <p className="text-sm text-destructive">
                  {errors.itens[index].descricao.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1">
              <Label>Data</Label>
              <Input type="date" {...register(`itens.${index}.data`)} />
            </div>

            <div className="md:col-span-1 space-y-1 ">
              <Label>Horário</Label>
              <Input
                type="time"
                {...register(`itens.${index}.hora`)}
                className="w-22"
              />
            </div>

            <div className="md:col-span-2 space-y-1 pl-4">
              <Label>Observações</Label>
              <Input {...register(`itens.${index}.observacoes`)} />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
