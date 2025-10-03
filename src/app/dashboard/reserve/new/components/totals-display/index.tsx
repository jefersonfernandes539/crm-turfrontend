"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";

interface Props {
  register: any;
  totalItensNET: number;
  valorRestante: number;
}

const TotalsDisplay: React.FC<Props> = ({
  register,
  totalItensNET,
  valorRestante,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Totais da Reserva</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Valor Entrada</Label>
          <Input {...register("entry_value_str")} />
        </div>

        <div className="space-y-1">
          <Label>Total NET</Label>
          <Input
            value={formatCurrency(totalItensNET * 100)}
            readOnly
            className="bg-muted font-bold"
          />
        </div>

        <div className="space-y-1">
          <Label>Valor Restante</Label>
          <Input
            value={formatCurrency(valorRestante * 100)}
            readOnly
            className="bg-muted font-bold"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalsDisplay;
