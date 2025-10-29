"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PricebookItem, VoucherFormData } from "@/types/Voucher";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import { PlusCircle, Trash2 } from "lucide-react";
import type {
  Control,
  FieldErrors,
  UseFieldArrayReturn,
} from "react-hook-form";
import { Controller } from "react-hook-form";

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
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
          className="flex items-center w-full sm:w-auto justify-center"
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

      <CardContent className="space-y-4">
        {itemFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-10 gap-3 p-3 border rounded-md bg-background/50"
            >
              <div className="col-span-full md:col-span-4 space-y-1">
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
                        <SelectTrigger className="w-full">
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

              <div className="col-span-full sm:col-span-1 md:col-span-2 space-y-1">
                <Label>Data</Label>
                <Input
                  type="date"
                  className="w-full"
                  {...register(`itens.${index}.data`)}
                />
              </div>

              <div className="col-span-full sm:col-span-1 md:col-span-2 space-y-1">
                <Label>Horário</Label>
                <Input
                  type="time"
                  {...register(`itens.${index}.hora`)}
                  className="w-full"
                />
              </div>

              <div className="col-span-full md:col-span-2 space-y-1">
                <Label>Observações</Label>
                <Input {...register(`itens.${index}.observacoes`)} />
              </div>

              {/* Remover */}
              <div className="col-span-full md:col-span-1 flex justify-end md:justify-center items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
        ))}          

      </CardContent>
    </Card>
}
