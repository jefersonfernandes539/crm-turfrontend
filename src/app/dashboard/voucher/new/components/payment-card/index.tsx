"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Control } from "react-hook-form";
import { VoucherFormData } from "@/utils/lib/schemas/voucher-schema";

interface PaymentCardProps {
  control: Control<VoucherFormData>;
}

export function PaymentCard({ control }: PaymentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Valores</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          name="total"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number.parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="entrada"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sinal/Entrada (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number.parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="restante"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Restante (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  readOnly
                  className="bg-muted"
                  placeholder="0.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>

      <CardFooter>
        <FormField
          name="observacoes"
          control={control}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Observações / Regras</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Adicione observações importantes sobre o voucher..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardFooter>
    </Card>
  );
}
