"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Control, UseFieldArrayReturn } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import { VoucherFormData } from "@/utils/lib/schemas/voucher-schema";

interface ItemsCardProps {
  control: Control<VoucherFormData>;
  fields: UseFieldArrayReturn<VoucherFormData, "itens">["fields"];
  append: UseFieldArrayReturn<VoucherFormData, "itens">["append"];
  remove: UseFieldArrayReturn<VoucherFormData, "itens">["remove"];
}

export function ItemsCard({ control, fields, append, remove }: ItemsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passeios / Hospedagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col md:flex-row items-end gap-4 p-4 border rounded-lg bg-muted/30"
          >
            <FormField
              name={`itens.${index}.descricao`}
              control={control}
              render={({ field }) => (
                <FormItem className="flex-grow w-full">
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Passeio de buggy" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={`itens.${index}.data`}
              control={control}
              render={({ field }) => (
                <FormItem className="w-full md:w-auto">
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={`itens.${index}.hora`}
              control={control}
              render={({ field }) => (
                <FormItem className="w-full md:w-auto">
                  <FormLabel>Hora</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ descricao: "", data: "", hora: "" })}
          className="w-full md:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </CardContent>
    </Card>
  );
}
