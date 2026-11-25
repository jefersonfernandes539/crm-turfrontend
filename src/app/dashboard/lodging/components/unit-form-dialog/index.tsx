"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  LodgingUnit,
  LodgingUnitInput,
  LodgingUnitType,
} from "@/types/Lodging";
import {
  BOOKING_MODE_LABEL,
  PRICE_MODE_LABEL,
  UNIT_TYPES,
} from "@/utils/lodging";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  type: z.enum([
    "private_room",
    "dorm",
    "camping_tent",
    "camping_rv",
    "cabin",
    "glamping",
    "other",
  ]),
  booking_mode: z.enum(["exclusive", "shared"]),
  capacity: z.coerce.number().int().min(1, "Mínimo 1"),
  price_mode: z.enum(["per_unit", "per_person"]),
  nightly_rate: z.coerce.number().min(0, "Valor inválido"),
  description: z.string().optional(),
  active: z.boolean(),
  sort_order: z.coerce.number().int(),
});

type FormValues = z.input<typeof schema>;

const EMPTY: FormValues = {
  name: "",
  type: "private_room",
  booking_mode: "exclusive",
  capacity: 2,
  price_mode: "per_unit",
  nightly_rate: 0,
  description: "",
  active: true,
  sort_order: 0,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: LodgingUnit | null;
  onSubmit: (input: LodgingUnitInput) => Promise<boolean>;
};

export function UnitFormDialog({ open, onOpenChange, unit, onSubmit }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });
  const { register, control, handleSubmit, reset, setValue, watch, formState } =
    form;

  useEffect(() => {
    if (!open) return;
    reset(
      unit
        ? {
            name: unit.name,
            type: unit.type,
            booking_mode: unit.booking_mode,
            capacity: unit.capacity,
            price_mode: unit.price_mode,
            nightly_rate: Number(unit.nightly_rate),
            description: unit.description ?? "",
            active: unit.active,
            sort_order: unit.sort_order,
          }
        : EMPTY
    );
  }, [open, unit, reset]);

  const bookingMode = watch("booking_mode");

  const submit = handleSubmit(async (raw) => {
    const values = schema.parse(raw);
    const ok = await onSubmit({
      ...values,
      description: values.description?.trim() || null,
    });
    if (ok) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {unit ? "Editar acomodação" : "Nova acomodação"}
          </DialogTitle>
          <DialogDescription>
            Quartos, camas de dormitório, áreas de camping, chalés…
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="unit-name">Nome</Label>
            <Input
              id="unit-name"
              placeholder="Ex.: Dorm misto 6 camas, Quarto 3, Lote A12"
              {...register("name")}
            />
            {formState.errors.name && (
              <p className="text-xs text-destructive">
                {formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    const type = v as LodgingUnitType;
                    field.onChange(type);
                    // Sugere o modo de venda típico do tipo escolhido
                    if (!unit) {
                      setValue("booking_mode", UNIT_TYPES[type].defaults.booking_mode);
                      setValue("price_mode", UNIT_TYPES[type].defaults.price_mode);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_TYPES).map(([key, t]) => (
                      <SelectItem key={key} value={key}>
                        <t.icon className="h-4 w-4" /> {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit-capacity">
              {bookingMode === "shared" ? "Vagas / camas" : "Capacidade (pessoas)"}
            </Label>
            <Input
              id="unit-capacity"
              type="number"
              min={1}
              {...register("capacity")}
            />
            {formState.errors.capacity && (
              <p className="text-xs text-destructive">
                {formState.errors.capacity.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Como é vendida</Label>
            <Controller
              control={control}
              name="booking_mode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BOOKING_MODE_LABEL).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit-rate">Diária (R$)</Label>
            <Input
              id="unit-rate"
              type="number"
              step="0.01"
              min={0}
              {...register("nightly_rate")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cobrança</Label>
            <Controller
              control={control}
              name="price_mode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRICE_MODE_LABEL).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="unit-desc">Descrição / comodidades</Label>
            <Textarea
              id="unit-desc"
              rows={2}
              placeholder="Banheiro compartilhado, ponto de energia, sombra, armário com cadeado…"
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit-order">Ordem no mapa</Label>
            <Input id="unit-order" type="number" {...register("sort_order")} />
          </div>

          <div className="flex items-end gap-3 pb-1">
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <Switch
                  id="unit-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="unit-active">Disponível para venda</Label>
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {unit ? "Salvar" : "Criar acomodação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
