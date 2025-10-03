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
import { Checkbox } from "@/components/ui/checkbox";
import type { Control, UseFieldArrayReturn } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import { VoucherFormData } from "@/utils/lib/schemas/voucher-schema";

interface PassengersCardProps {
  control: Control<VoucherFormData>;
  fields: UseFieldArrayReturn<VoucherFormData, "passageiros">["fields"];
  append: UseFieldArrayReturn<VoucherFormData, "passageiros">["append"];
  remove: UseFieldArrayReturn<VoucherFormData, "passageiros">["remove"];
}

export function PassengersCard({
  control,
  fields,
  append,
  remove,
}: PassengersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passageiros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col md:flex-row items-end gap-4 p-4 border rounded-lg bg-muted/30"
          >
            <FormField
              name={`passageiros.${index}.nome`}
              control={control}
              render={({ field }) => (
                <FormItem className="flex-grow w-full">
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={`passageiros.${index}.telefone`}
              control={control}
              render={({ field }) => (
                <FormItem className="w-full md:w-auto">
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(00) 00000-0000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={`passageiros.${index}.colo`}
              control={control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 pb-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Criança de Colo?
                  </FormLabel>
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
          onClick={() => append({ nome: "", telefone: "", colo: false })}
          className="w-full md:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Passageiro
        </Button>
      </CardContent>
    </Card>
  );
}
