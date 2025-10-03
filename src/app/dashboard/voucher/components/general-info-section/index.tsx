"use client";

import type { Control, FieldErrors } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Controller } from "react-hook-form";
import type { VoucherFormData, Operator } from "@/types/Voucher";

interface GeneralInfoSectionProps {
  register: any;
  control: Control<VoucherFormData>;
  errors: FieldErrors<VoucherFormData>;
  operators: Operator[];
  sellers: string[];
}

export function GeneralInfoSection({
  register,
  control,
  errors,
  operators,
  sellers,
}: GeneralInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Gerais</CardTitle>
        <CardDescription>
          Informações principais do contratante e da reserva.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Contratante *</Label>
          <Input
            {...register("contratante", {
              required: "Contratante é obrigatório",
            })}
          />
          {errors.contratante && (
            <p className="text-sm text-destructive">
              {errors.contratante.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Telefone</Label>
          <Input {...register("telefone")} />
        </div>

        <div className="space-y-1">
          <Label>Local de Embarque</Label>
          <Input {...register("embarque")} />
        </div>

        <div className="space-y-1">
          <Label>Operadora</Label>
          <Controller
            name="operadora"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label>Vendedor</Label>
          <Controller
            name="vendedor"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label>Código</Label>
          <Input
            readOnly
            {...register("codigo")}
            className="text-muted-foreground"
          />
        </div>
      </CardContent>
    </Card>
  );
}
