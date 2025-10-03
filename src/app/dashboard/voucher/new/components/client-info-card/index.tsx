import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { VoucherFormData } from "@/utils/lib/schemas/voucher-schema"
import type { Control } from "react-hook-form"

interface ClientInfoCardProps {
  control: Control<VoucherFormData>
}

export function ClientInfoCard({ control }: ClientInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          name="contratante"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contratante</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome do contratante" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="telefone"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="(00) 00000-0000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="embarque"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotel/Embarque</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Local de embarque" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
