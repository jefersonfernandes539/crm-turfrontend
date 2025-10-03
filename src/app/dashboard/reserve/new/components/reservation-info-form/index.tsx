"use client";
import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Seller } from "@/types/Seller";

interface Props {
  control: any;
  register: any;
  errors: any;
  operators: { id: string; name: string }[];
  sellers: Seller[];
}

const ReservationInfoForm: React.FC<Props> = ({
  control,
  register,
  errors,
  operators,
  sellers,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Informações da Reserva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            {...register("code")}
            readOnly
            className="bg-muted"
          />
        </div>

        <div className="space-y-1">
          <Label>Operadora</Label>
          <Controller
            name="operator_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a operadora" />
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
          {errors.operator_id && (
            <p className="text-sm text-destructive">
              {errors.operator_id.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Vendedor</Label>
          <Controller
            name="seller"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.seller && (
            <p className="text-sm text-destructive">{errors.seller.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="contractor_name">Nome do Contratante</Label>
          <Input id="contractor_name" {...register("contractor_name")} />
          {errors.contractor_name && (
            <p className="text-sm text-destructive">
              {errors.contractor_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="embark_place">Local de Embarque</Label>
          <Input id="embark_place" {...register("embark_place")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="date">Data</Label>
          <Input type="date" id="date" {...register("date")} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Observações</Label>
          <Input id="notes" {...register("notes")} placeholder="Opcional" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationInfoForm;
