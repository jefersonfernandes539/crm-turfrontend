"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  PlusCircle,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/app/dashboard/components/stat-card";
import { useLodgingStays, useLodgingUnits } from "@/hooks/use-lodging";
import type { LodgingStay, LodgingStayStatus, LodgingUnit } from "@/types/Lodging";
import { cn } from "@/utils/lib/utils";
import {
  STAY_STATUS,
  UNIT_TYPES,
  addDaysISO,
  diffDays,
  formatShortDate,
  guestsOf,
  isActiveStay,
  occupancyOn,
  todayISO,
  weekdayShort,
} from "@/utils/lodging";
import { StayFormDialog, type StayPrefill } from "./components/stay-form-dialog";

const WINDOW_DAYS = 14;

export default function LodgingMapPage() {
  const today = todayISO();
  const [start, setStart] = useState(addDaysISO(today, -1));
  const end = addDaysISO(start, WINDOW_DAYS - 1);
  const days = useMemo(
    () => Array.from({ length: WINDOW_DAYS }, (_, i) => addDaysISO(start, i)),
    [start]
  );

  const { units, loading: loadingUnits } = useLodgingUnits({ onlyActive: true });
  const windowStays = useLodgingStays({ from: start, to: end });
  // 30 dias para trás para pegar também check-outs atrasados
  const todayStays = useLodgingStays({ from: addDaysISO(today, -30), to: today });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LodgingStay | null>(null);
  const [prefill, setPrefill] = useState<StayPrefill | undefined>();

  const refreshAll = () => {
    windowStays.fetchStays();
    todayStays.fetchStays();
  };

  const openNew = (p?: StayPrefill) => {
    setEditing(null);
    setPrefill(p);
    setFormOpen(true);
  };
  const openEdit = (stay: LodgingStay) => {
    setEditing(stay);
    setPrefill(undefined);
    setFormOpen(true);
  };

  const changeStatus = async (stay: LodgingStay, to: LodgingStayStatus) => {
    if (await todayStays.updateStatus(stay, to)) windowStays.fetchStays();
  };

  /* ---------------- indicadores de hoje ---------------- */
  const stats = useMemo(() => {
    const active = todayStays.stays.filter(isActiveStay);
    const capacity = units.reduce((acc, u) => acc + u.capacity, 0);
    const occupiedTonight = units.reduce(
      (acc, u) => acc + Math.min(u.capacity, occupancyFor(u, active, today)),
      0
    );
    return {
      capacity,
      occupiedTonight,
      rate: capacity ? Math.round((occupiedTonight / capacity) * 100) : 0,
      inHouse: active
        .filter((s) => s.status === "checked_in")
        .reduce((acc, s) => acc + guestsOf(s), 0),
      arrivals: active.filter(
        (s) =>
          s.check_in === today &&
          (s.status === "reserved" || s.status === "confirmed")
      ),
      departures: active.filter(
        (s) => s.check_out <= today && s.status === "checked_in"
      ),
    };
  }, [todayStays.stays, units, today]);

  const loading = loadingUnits || todayStays.loading;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Mapa de ocupação"
        description="Quartos, dormitórios e áreas de camping dia a dia."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/lodging/units">Acomodações</Link>
            </Button>
            <Button onClick={() => openNew()} disabled={units.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova estadia
            </Button>
          </>
        }
      />

      {/* ---------------- KPIs ---------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ocupação esta noite"
          value={`${stats.rate}%`}
          description={`${stats.occupiedTonight} de ${stats.capacity} vagas`}
          icon={<BedDouble className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Hóspedes na casa"
          value={String(stats.inHouse)}
          description="com check-in feito"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Chegadas hoje"
          value={String(stats.arrivals.length)}
          description="aguardando check-in"
          icon={<LogIn className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Saídas pendentes"
          value={String(stats.departures.length)}
          description="check-out hoje ou atrasado"
          icon={<LogOut className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      {/* ---------------- Chegadas / saídas ---------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MovementList
          title="Chegadas de hoje"
          empty="Nenhuma chegada prevista."
          stays={stats.arrivals}
          actionLabel="Check-in"
          onAction={(s) => changeStatus(s, "checked_in")}
          onOpen={openEdit}
        />
        <MovementList
          title="Saídas pendentes"
          empty="Nenhuma saída pendente."
          stays={stats.departures}
          actionLabel="Check-out"
          onAction={(s) => changeStatus(s, "checked_out")}
          onOpen={openEdit}
        />
      </div>

      {/* ---------------- Grade ---------------- */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4" />
            {formatShortDate(start)} – {formatShortDate(end)}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="outline"
              aria-label="Semana anterior"
              onClick={() => setStart(addDaysISO(start, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStart(addDaysISO(today, -1))}
            >
              Hoje
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Próxima semana"
              onClick={() => setStart(addDaysISO(start, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {units.length === 0 && !loadingUnits ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma acomodação ativa.{" "}
              <Link href="/dashboard/lodging/units" className="underline">
                Cadastre quartos, camas ou áreas de camping
              </Link>
              .
            </div>
          ) : (
            <OccupancyGrid
              units={units}
              stays={windowStays.stays}
              days={days}
              today={today}
              onEmptyClick={(unit, day) =>
                openNew({ unit_id: unit.id, check_in: day })
              }
              onStayClick={openEdit}
            />
          )}
          <Legend />
        </CardContent>
      </Card>

      <StayFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) refreshAll();
        }}
        units={units}
        stay={editing}
        prefill={prefill}
        onSubmit={(input) => todayStays.saveStay(input, editing?.id)}
      />
    </div>
  );
}

/* ================================================================== */

function occupancyFor(unit: LodgingUnit, stays: LodgingStay[], day: string) {
  const occ = occupancyOn(stays, unit.id, day);
  // Unidade exclusiva ocupada conta como cheia
  return unit.booking_mode === "exclusive" && occ > 0 ? unit.capacity : occ;
}

function MovementList({
  title,
  empty,
  stays,
  actionLabel,
  onAction,
  onOpen,
}: {
  title: string;
  empty: string;
  stays: LodgingStay[];
  actionLabel: string;
  onAction: (s: LodgingStay) => void;
  onOpen: (s: LodgingStay) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stays.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">{empty}</p>
        ) : (
          stays.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-md border p-2.5"
            >
              <button
                type="button"
                className="min-w-0 text-left"
                onClick={() => onOpen(s)}
              >
                <p className="truncate text-sm font-medium">{s.guest_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.lodging_units?.name} · {guestsOf(s)} pax
                  {s.vehicle_plate ? ` · ${s.vehicle_plate}` : ""}
                  {Number(s.total) > Number(s.paid_amount)
                    ? ` · receber ${(Number(s.total) - Number(s.paid_amount)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                    : ""}
                </p>
              </button>
              <Button size="sm" onClick={() => onAction(s)}>
                {actionLabel}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function OccupancyGrid({
  units,
  stays,
  days,
  today,
  onEmptyClick,
  onStayClick,
}: {
  units: LodgingUnit[];
  stays: LodgingStay[];
  days: string[];
  today: string;
  onEmptyClick: (unit: LodgingUnit, day: string) => void;
  onStayClick: (stay: LodgingStay) => void;
}) {
  const first = days[0];
  const last = days[days.length - 1];
  const active = stays.filter(isActiveStay);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[900px] text-xs"
        style={{
          gridTemplateColumns: `minmax(150px, 190px) repeat(${days.length}, minmax(44px, 1fr))`,
        }}
      >
        {/* Cabeçalho */}
        <div className="sticky left-0 z-20 border-b bg-card p-2 font-medium text-muted-foreground">
          Acomodação
        </div>
        {days.map((d) => (
          <div
            key={d}
            className={cn(
              "border-b border-l p-1 text-center",
              d === today && "bg-primary/10 font-semibold text-primary"
            )}
          >
            <div className="capitalize">{weekdayShort(d).replace(".", "")}</div>
            <div>{formatShortDate(d)}</div>
          </div>
        ))}

        {/* Linhas */}
        {units.map((unit, idx) => {
          const row = idx + 2;
          const t = UNIT_TYPES[unit.type] ?? UNIT_TYPES.other;
          const unitStays = active.filter((s) => s.unit_id === unit.id);

          return (
            <div key={unit.id} className="contents">
              <div
                className="sticky left-0 z-20 flex items-center gap-2 border-b bg-card p-2"
                style={{ gridRow: row, gridColumn: 1 }}
              >
                <t.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{unit.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {unit.capacity}{" "}
                    {unit.booking_mode === "shared" ? "vagas" : "pax"}
                  </p>
                </div>
              </div>

              {unit.booking_mode === "shared" ? (
                // Compartilhada: mostra vagas ocupadas por noite
                days.map((d, i) => {
                  const occ = occupancyOn(unitStays, unit.id, d);
                  const ratio = occ / unit.capacity;
                  return (
                    <button
                      key={d}
                      type="button"
                      title={`${occ}/${unit.capacity} ocupadas — clique para reservar`}
                      onClick={() => onEmptyClick(unit, d)}
                      style={{ gridRow: row, gridColumn: i + 2 }}
                      className={cn(
                        "m-0.5 flex min-h-10 items-center justify-center rounded border text-[11px] font-medium transition-colors hover:ring-2 hover:ring-primary/40",
                        occ === 0 && "border-dashed text-muted-foreground/60",
                        ratio > 0 && ratio < 0.75 && "border-sky-500/30 bg-sky-500/15",
                        ratio >= 0.75 && ratio < 1 && "border-amber-500/40 bg-amber-500/20",
                        ratio >= 1 && "border-red-500/40 bg-red-500/20"
                      )}
                    >
                      {occ}/{unit.capacity}
                    </button>
                  );
                })
              ) : (
                <>
                  {/* Células livres (clicáveis) */}
                  {days.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      aria-label={`Reservar ${unit.name} em ${formatShortDate(d)}`}
                      onClick={() => onEmptyClick(unit, d)}
                      style={{ gridRow: row, gridColumn: i + 2 }}
                      className={cn(
                        "min-h-11 border-b border-l transition-colors hover:bg-primary/5",
                        d === today && "bg-primary/5"
                      )}
                    />
                  ))}
                  {/* Barras das estadias */}
                  {unitStays.map((s) => {
                    const from = s.check_in < first ? first : s.check_in;
                    const lastNight = addDaysISO(s.check_out, -1);
                    const to = lastNight > last ? last : lastNight;
                    if (to < from) return null;
                    const col = diffDays(first, from) + 2;
                    const span = diffDays(from, to) + 1;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onStayClick(s)}
                        title={`${s.guest_name} · ${STAY_STATUS[s.status].label}`}
                        style={{ gridRow: row, gridColumn: `${col} / span ${span}` }}
                        className={cn(
                          "z-10 m-1 truncate rounded-md px-2 text-left text-[11px] font-medium text-white shadow-sm hover:brightness-110",
                          STAY_STATUS[s.status].bar,
                          s.check_in < first && "rounded-l-none",
                          lastNight > last && "rounded-r-none"
                        )}
                      >
                        {s.guest_name} · {guestsOf(s)}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  const items: LodgingStayStatus[] = ["reserved", "confirmed", "checked_in", "checked_out"];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {items.map((k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded-sm", STAY_STATUS[k].bar)} />
          {STAY_STATUS[k].label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border border-amber-500/40 bg-amber-500/20" />
        Dormitório/camping quase cheio
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border border-red-500/40 bg-red-500/20" />
        Lotado
      </span>
    </div>
  );
}
