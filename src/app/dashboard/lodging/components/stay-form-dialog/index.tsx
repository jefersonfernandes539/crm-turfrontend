"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { db } from "@/services/db";
import { useSellerOptions } from "@/hooks/use-lodging";
import type {
  LodgingStay,
  LodgingStayInput,
  LodgingUnit,
} from "@/types/Lodging";
import { formatCurrency } from "@/utils/lib/helpers/formatCurrency";
import {
  STAY_SOURCES,
  STAY_STATUS,
  UNIT_TYPES,
  addDaysISO,
  checkAvailability,
  computeStayTotal,
  nightsBetween,
  todayISO,
} from "@/utils/lodging";

const NONE = "__none__";

const schema = z
  .object({
    unit_id: z.string().min(1, "Escolha a acomodação"),
    guest_name: z.string().trim().min(1, "Informe o hóspede"),
    guest_phone: z.string().optional(),
    guest_document: z.string().optional(),
    check_in: z.string().min(1, "Informe a entrada"),
    check_out: z.string().min(1, "Informe a saída"),
    adults: z.coerce.number().int().min(0),
    children: z.coerce.number().int().min(0),
    vehicle_plate: z.string().optional(),
    status: z.enum([
      "reserved",
      "confirmed",
      "checked_in",
      "checked_out",
      "cancelled",
    ]),
    nightly_rate: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
    paid_amount: z.coerce.number().min(0),
    seller_id: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((v) => v.check_out > v.check_in, {
    path: ["check_out"],
    message: "A saída deve ser depois da entrada",
  })
  .refine((v) => v.adults + v.children > 0, {
    path: ["adults"],
    message: "Pelo menos 1 hóspede",
  });

type FormValues = z.input<typeof schema>;

export type StayPrefill = Partial<Pick<LodgingStay, "unit_id" | "check_in">>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: LodgingUnit[];
  stay?: LodgingStay | null;
  prefill?: StayPrefill;
  onSubmit: (input: LodgingStayInput) => Promise<boolean>;
};

const emptyValues = (prefill?: StayPrefill): FormValues => {
  const checkIn = prefill?.check_in ?? todayISO();
  return {
    unit_id: prefill?.unit_id ?? "",
    guest_name: "",
    guest_phone: "",
    guest_document: "",
    check_in: checkIn,
    check_out: addDaysISO(checkIn, 1),
    adults: 1,
    children: 0,
    vehicle_plate: "",
    status: "reserved",
    nightly_rate: 0,
    total: 0,
    paid_amount: 0,
    seller_id: NONE,
    source: "",
    notes: "",
  };
};

export function StayFormDialog({
  open,
  onOpenChange,
  units,
  stay,
  prefill,
  onSubmit,
}: Props) {
  const sellers = useSellerOptions();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(prefill),
  });
  const { register, control, handleSubmit, reset, setValue, watch, formState } =
    form;

  const [availability, setAvailability] = useState<{
    checking: boolean;
    error: string | null;
  }>({ checking: false, error: null });

  /* ---------------- carga inicial ---------------- */
  useEffect(() => {
    if (!open) return;
    if (stay) {
      reset({
        unit_id: stay.unit_id,
        guest_name: stay.guest_name,
        guest_phone: stay.guest_phone ?? "",
        guest_document: stay.guest_document ?? "",
        check_in: stay.check_in,
        check_out: stay.check_out,
        adults: stay.adults,
        children: stay.children,
        vehicle_plate: stay.vehicle_plate ?? "",
        status: stay.status,
        nightly_rate: Number(stay.nightly_rate),
        total: Number(stay.total),
        paid_amount: Number(stay.paid_amount),
        seller_id: stay.seller_id ?? NONE,
        source: stay.source ?? "",
        notes: stay.notes ?? "",
      });
    } else {
      const values = emptyValues(prefill);
      const unit = units.find((u) => u.id === values.unit_id);
      if (unit) values.nightly_rate = Number(unit.nightly_rate);
      reset(values);
    }
  }, [open, stay, prefill, units, reset]);

  const [unitId, checkIn, checkOut, adults, children, nightlyRate, total, paid, status] =
    watch([
      "unit_id",
      "check_in",
      "check_out",
      "adults",
      "children",
      "nightly_rate",
      "total",
      "paid_amount",
      "status",
    ]);

  const unit = useMemo(
    () => units.find((u) => u.id === unitId) ?? null,
    [units, unitId]
  );
  const nights = nightsBetween(String(checkIn), String(checkOut));
  const guests = Number(adults || 0) + Number(children || 0);
  const isCamping = unit?.type === "camping_tent" || unit?.type === "camping_rv";

  /* ---------------- total automático ---------------- */
  useEffect(() => {
    // Ao editar, só recalcula depois que o usuário mexer em algo
    if (!open || (stay && !formState.isDirty)) return;
    setValue(
      "total",
      computeStayTotal({
        unit,
        nightlyRate: Number(nightlyRate || 0),
        nights,
        adults: Number(adults || 0),
        children: Number(children || 0),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, nightlyRate, nights, adults, children]);

  /* ---------------- disponibilidade ---------------- */
  useEffect(() => {
    if (!open || !unit || nights <= 0 || status === "cancelled") {
      setAvailability({ checking: false, error: null });
      return;
    }
    let cancelled = false;
    setAvailability((a) => ({ ...a, checking: true }));

    const timer = setTimeout(async () => {
      const { data } = await db
        .from("lodging_stays")
        .select("*")
        .eq("unit_id", unit.id)
        .neq("status", "cancelled")
        .lt("check_in", checkOut)
        .gt("check_out", checkIn);

      if (cancelled) return;
      setAvailability({
        checking: false,
        error: checkAvailability({
          unit,
          stays: (data as LodgingStay[]) || [],
          checkIn: String(checkIn),
          checkOut: String(checkOut),
          guests,
          ignoreId: stay?.id,
        }),
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, unit, checkIn, checkOut, guests, nights, status, stay?.id]);

  const submit = handleSubmit(async (raw) => {
    const v = schema.parse(raw);
    const ok = await onSubmit({
      unit_id: v.unit_id,
      guest_name: v.guest_name,
      guest_phone: v.guest_phone?.trim() || null,
      guest_document: v.guest_document?.trim() || null,
      check_in: v.check_in,
      check_out: v.check_out,
      adults: v.adults,
      children: v.children,
      vehicle_plate: v.vehicle_plate?.trim().toUpperCase() || null,
      status: v.status,
      nightly_rate: v.nightly_rate,
      total: v.total,
      paid_amount: v.paid_amount,
      seller_id: v.seller_id && v.seller_id !== NONE ? v.seller_id : null,
      source: v.source || null,
      notes: v.notes?.trim() || null,
    });
    if (ok) onOpenChange(false);
  });

  const err = formState.errors;
  const remaining = Math.max(0, Number(total || 0) - Number(paid || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {stay ? `Estadia ${stay.code}` : "Nova estadia"}
          </DialogTitle>
          <DialogDescription>
            Hospedagem em quarto, cama de dormitório, camping ou chalé.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          {/* ---------- Acomodação e período ---------- */}
          <div className="grid gap-4 sm:grid-cols-6">
            <div className="space-y-1.5 sm:col-span-6">
              <Label>Acomodação</Label>
              <Controller
                control={control}
                name="unit_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      const u = units.find((x) => x.id === v);
                      if (u) setValue("nightly_rate", Number(u.nightly_rate), { shouldDirty: true });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => {
                        const t = UNIT_TYPES[u.type] ?? UNIT_TYPES.other;
                        return (
                          <SelectItem key={u.id} value={u.id}>
                            <t.icon className="h-4 w-4" /> {u.name}
                            <span className="text-muted-foreground">
                              · {u.capacity}{" "}
                              {u.booking_mode === "shared" ? "vagas" : "pax"}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {err.unit_id && (
                <p className="text-xs text-destructive">{err.unit_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="stay-in">Check-in</Label>
              <Input id="stay-in" type="date" {...register("check_in")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="stay-out">Check-out</Label>
              <Input id="stay-out" type="date" {...register("check_out")} />
              {err.check_out && (
                <p className="text-xs text-destructive">{err.check_out.message}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="stay-adults">Adultos</Label>
              <Input id="stay-adults" type="number" min={0} {...register("adults")} />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="stay-children">Crianças</Label>
              <Input id="stay-children" type="number" min={0} {...register("children")} />
            </div>
            {err.adults && (
              <p className="text-xs text-destructive sm:col-span-6">
                {err.adults.message}
              </p>
            )}

            {unit && nights > 0 && (
              <div
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm sm:col-span-6 ${
                  availability.error
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {availability.checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : availability.error ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {availability.checking
                  ? "Verificando disponibilidade…"
                  : availability.error ??
                    `Disponível · ${nights} noite(s) · ${guests} hóspede(s)`}
              </div>
            )}
          </div>

          <Separator />

          {/* ---------- Hóspede ---------- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="stay-guest">Hóspede responsável</Label>
              <Input id="stay-guest" {...register("guest_name")} />
              {err.guest_name && (
                <p className="text-xs text-destructive">{err.guest_name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay-phone">Telefone / WhatsApp</Label>
              <Input id="stay-phone" {...register("guest_phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay-doc">Documento (CPF / passaporte)</Label>
              <Input id="stay-doc" {...register("guest_document")} />
            </div>
            {(isCamping || watch("vehicle_plate")) && (
              <div className="space-y-1.5">
                <Label htmlFor="stay-plate">Placa do veículo</Label>
                <Input
                  id="stay-plate"
                  className="uppercase"
                  {...register("vehicle_plate")}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Controller
                control={control}
                name="source"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Canal de venda" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAY_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* ---------- Valores ---------- */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="stay-rate">
                Diária{unit?.price_mode === "per_person" ? " por pessoa" : ""} (R$)
              </Label>
              <Input id="stay-rate" type="number" step="0.01" min={0} {...register("nightly_rate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay-total">Total (R$)</Label>
              <Input id="stay-total" type="number" step="0.01" min={0} {...register("total")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay-paid">Pago / sinal (R$)</Label>
              <Input id="stay-paid" type="number" step="0.01" min={0} {...register("paid_amount")} />
            </div>
            <p className="text-sm text-muted-foreground sm:col-span-3">
              A receber no check-in:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(remaining)}
              </span>
            </p>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STAY_STATUS).map(([k, s]) => (
                        <SelectItem key={k} value={k}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Vendedor</Label>
              <Controller
                control={control}
                name="seller_id"
                render={({ field }) => (
                  <Select value={field.value || NONE} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem vendedor</SelectItem>
                      {sellers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="stay-notes">Observações</Label>
              <Textarea
                id="stay-notes"
                rows={2}
                placeholder="Horário previsto de chegada, aluguel de barraca, café da manhã, pet…"
                {...register("notes")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={formState.isSubmitting || availability.checking || !!availability.error}
            >
              {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {stay ? "Salvar" : "Criar estadia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
