"use client";

import React, { useEffect, useMemo } from "react";
import { useWatch, Control, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReservationFormValues } from "@/utils/lib/schemas/reservation-schema";
import {
  formatBRL,
  formatCurrencyBRL,
  parseCurrency,
  parseCurrencyBRL,
} from "@/utils/lib/helpers/formatCurrency";

interface Props {
  control: Control<ReservationFormValues>;
  setValue: UseFormSetValue<ReservationFormValues>;
}

const TotalsDisplay: React.FC<Props> = ({ control, setValue }) => {
  const watchedItems = useWatch({ control, name: "items", defaultValue: [] });
  const watchedEntryValue = useWatch({
    control,
    name: "entry_value_str",
    defaultValue: "0,00",
  });

  const entryValueCents = useMemo(
    () => parseCurrency(watchedEntryValue),
    [watchedEntryValue]
  );

  const totalItensNET = useMemo(() => {
    if (!Array.isArray(watchedItems)) return 0;
    return watchedItems.reduce(
      (acc, item) =>
        acc +
        Math.round(
          (item.net ?? 0) *
            (item.quantity ?? 1) *
            (item.transfer_multiplier ?? 1)
        ),
      0
    );
  }, [watchedItems]);

  const valorRestante = useMemo(
    () => Math.max(totalItensNET - entryValueCents, 0),
    [totalItensNET, entryValueCents]
  );

  useEffect(() => {
    setValue("total_items_net", totalItensNET, { shouldValidate: true });
    setValue("remaining", valorRestante, { shouldValidate: true });
    setValue("entry_value", entryValueCents, { shouldValidate: true }); 
  }, [totalItensNET, valorRestante, entryValueCents, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Totais da Reserva</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Valor Entrada</Label>
          <Input
            value={watchedEntryValue}
            onChange={(e) => {
              const formatted = formatCurrencyBRL(e.target.value);
              const cents = parseCurrencyBRL(e.target.value);
              setValue("entry_value_str", formatted);
              setValue("entry_value", cents);
            }}
          />
        </div>

        <div className="space-y-1">
          <Label>Total NET</Label>
          <Input
            value={formatBRL(totalItensNET)}
            readOnly
            className="bg-muted font-bold"
          />
        </div>

        <div className="space-y-1">
          <Label>Valor Restante</Label>
          <Input
            value={formatBRL(valorRestante)}
            readOnly
            className="bg-muted font-bold"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalsDisplay;
