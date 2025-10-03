import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VoucherFormData } from "@/utils/lib/schemas/voucher-schema";
import type { Control } from "react-hook-form";

interface GeneralInfoCardProps {
  control: Control<VoucherFormData>;
}

export function GeneralInfoCard({ control }: GeneralInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="codigo"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código da Reserva</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="vendedor"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendedor</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome do vendedor" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
