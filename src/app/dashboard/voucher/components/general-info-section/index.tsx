"use client";

import type { Control, FieldErrors } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Input } from "@/components";

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
          <Controller
            name="contratante"
            control={control}
            rules={{ required: "Contratante é obrigatório" }}
            render={({ field }) => (
              <Input.Base
                id="contratante"
                label="Contratante"
                isRequired
                isInvalid={!!errors.contratante}
                errorMessage={errors.contratante?.message as string}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-1">
          <Controller
            name="telefone"
            control={control}
            rules={{ required: "Telefone é obrigatório" }}
            render={({ field }) => (
              <Input.Phone
                id="telefone"
                label="Telefone"
                isRequired
                isInvalid={!!errors.telefone}
                errorMessage={errors.telefone?.message as string}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-1">
          <Controller
            name="embarque"
            control={control}
            rules={{ required: "Local de embarque é obrigatório" }}
            render={({ field }) => (
              <Input.Base
                id="embarque"
                label="Local de Embarque"
                isRequired
                isInvalid={!!errors.embarque}
                errorMessage={errors.embarque?.message as string}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
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
          <Controller
            name="codigo"
            control={control}
            render={({ field }) => (
              <Input.Base
                id="codigo"
                label="Código"
                value={field.value}
                readOnly
                isDisabled
                className="text-muted-foreground"
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
