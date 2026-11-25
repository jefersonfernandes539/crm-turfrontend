import {
  BedDouble,
  BedSingle,
  Caravan,
  Home,
  Tent,
  TentTree,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type {
  LodgingBookingMode,
  LodgingPriceMode,
  LodgingStay,
  LodgingStayStatus,
  LodgingUnit,
  LodgingUnitType,
} from "@/types/Lodging";

/* ------------------------------------------------------------------ */
/* Rótulos                                                             */
/* ------------------------------------------------------------------ */

export const UNIT_TYPES: Record<
  LodgingUnitType,
  {
    label: string;
    icon: LucideIcon;
    /** Sugestões aplicadas ao escolher o tipo no formulário */
    defaults: { booking_mode: LodgingBookingMode; price_mode: LodgingPriceMode };
  }
> = {
  private_room: {
    label: "Quarto privativo",
    icon: BedDouble,
    defaults: { booking_mode: "exclusive", price_mode: "per_unit" },
  },
  dorm: {
    label: "Dormitório (cama)",
    icon: BedSingle,
    defaults: { booking_mode: "shared", price_mode: "per_person" },
  },
  camping_tent: {
    label: "Camping (barraca)",
    icon: Tent,
    defaults: { booking_mode: "shared", price_mode: "per_person" },
  },
  camping_rv: {
    label: "Motorhome / trailer",
    icon: Caravan,
    defaults: { booking_mode: "exclusive", price_mode: "per_unit" },
  },
  cabin: {
    label: "Chalé",
    icon: Home,
    defaults: { booking_mode: "exclusive", price_mode: "per_unit" },
  },
  glamping: {
    label: "Glamping",
    icon: TentTree,
    defaults: { booking_mode: "exclusive", price_mode: "per_unit" },
  },
  other: {
    label: "Outro",
    icon: Warehouse,
    defaults: { booking_mode: "exclusive", price_mode: "per_unit" },
  },
};

export const BOOKING_MODE_LABEL: Record<LodgingBookingMode, string> = {
  exclusive: "Unidade inteira (um grupo por vez)",
  shared: "Compartilhada (vende por vaga/cama)",
};

export const PRICE_MODE_LABEL: Record<LodgingPriceMode, string> = {
  per_unit: "por diária da unidade",
  per_person: "por pessoa / diária",
};

export const STAY_STATUS: Record<
  LodgingStayStatus,
  { label: string; className: string; bar: string }
> = {
  reserved: {
    label: "Reservada",
    className:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    bar: "bg-amber-500/80",
  },
  confirmed: {
    label: "Confirmada",
    className:
      "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
    bar: "bg-sky-500/80",
  },
  checked_in: {
    label: "Hospedado",
    className:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    bar: "bg-emerald-500/85",
  },
  checked_out: {
    label: "Finalizada",
    className: "bg-muted text-muted-foreground border-border",
    bar: "bg-muted-foreground/40",
  },
  cancelled: {
    label: "Cancelada",
    className:
      "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30 line-through",
    bar: "bg-red-500/40",
  },
};

export const STAY_SOURCES = [
  "Balcão",
  "WhatsApp",
  "Instagram",
  "Site",
  "Booking.com",
  "Airbnb",
  "Hostelworld",
  "Indicação",
  "Outro",
];

/* ------------------------------------------------------------------ */
/* Datas (sempre strings YYYY-MM-DD, calculadas em UTC p/ evitar fuso) */
/* ------------------------------------------------------------------ */

const toUTC = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

const DAY_MS = 86_400_000;

export const todayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const addDaysISO = (iso: string, days: number) =>
  new Date(toUTC(iso) + days * DAY_MS).toISOString().slice(0, 10);

export const diffDays = (from: string, to: string) =>
  Math.round((toUTC(to) - toUTC(from)) / DAY_MS);

export const nightsBetween = (checkIn: string, checkOut: string) =>
  checkIn && checkOut ? Math.max(0, diffDays(checkIn, checkOut)) : 0;

export const weekdayShort = (iso: string) =>
  new Date(toUTC(iso)).toLocaleDateString("pt-BR", {
    weekday: "short",
    timeZone: "UTC",
  });

export const formatShortDate = (iso: string) =>
  new Date(toUTC(iso)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });

/* ------------------------------------------------------------------ */
/* Regras de negócio                                                   */
/* ------------------------------------------------------------------ */

export const guestsOf = (s: Pick<LodgingStay, "adults" | "children">) =>
  (s.adults || 0) + (s.children || 0);

export const isActiveStay = (s: Pick<LodgingStay, "status">) =>
  s.status !== "cancelled";

/** A estadia ocupa a noite `day`? (check-out não conta) */
export const occupiesNight = (s: LodgingStay, day: string) =>
  s.check_in <= day && s.check_out > day;

export function computeStayTotal(params: {
  unit?: Pick<LodgingUnit, "price_mode"> | null;
  nightlyRate: number;
  nights: number;
  adults: number;
  children: number;
}) {
  const { unit, nightlyRate, nights, adults, children } = params;
  const multiplier =
    unit?.price_mode === "per_person" ? Math.max(1, adults + children) : 1;
  return Math.round(nightlyRate * nights * multiplier * 100) / 100;
}

/** Ocupação (pessoas) da unidade numa noite, ignorando `ignoreId`. */
export function occupancyOn(
  stays: LodgingStay[],
  unitId: string,
  day: string,
  ignoreId?: string
) {
  return stays
    .filter(
      (s) =>
        s.unit_id === unitId &&
        s.id !== ignoreId &&
        isActiveStay(s) &&
        occupiesNight(s, day)
    )
    .reduce((acc, s) => acc + guestsOf(s), 0);
}

/**
 * Valida disponibilidade no front (o banco também valida via trigger).
 * Retorna mensagem de erro ou null.
 */
export function checkAvailability(params: {
  unit: LodgingUnit;
  stays: LodgingStay[];
  checkIn: string;
  checkOut: string;
  guests: number;
  ignoreId?: string;
}): string | null {
  const { unit, stays, checkIn, checkOut, guests, ignoreId } = params;

  if (guests > unit.capacity && unit.booking_mode === "exclusive") {
    return `${unit.name} comporta no máximo ${unit.capacity} pessoa(s).`;
  }

  const nights = nightsBetween(checkIn, checkOut);
  for (let i = 0; i < nights; i++) {
    const day = addDaysISO(checkIn, i);
    const occupied = occupancyOn(stays, unit.id, day, ignoreId);

    if (unit.booking_mode === "exclusive" && occupied > 0) {
      return `${unit.name} já está ocupada na noite de ${formatShortDate(day)}.`;
    }
    if (unit.booking_mode === "shared" && occupied + guests > unit.capacity) {
      const free = Math.max(0, unit.capacity - occupied);
      return `${unit.name}: só ${free} vaga(s) livre(s) na noite de ${formatShortDate(day)}.`;
    }
  }
  return null;
}

/** Próximo passo operacional da estadia. */
export const NEXT_STATUS_ACTION: Partial<
  Record<LodgingStayStatus, { to: LodgingStayStatus; label: string }>
> = {
  reserved: { to: "confirmed", label: "Confirmar" },
  confirmed: { to: "checked_in", label: "Fazer check-in" },
  checked_in: { to: "checked_out", label: "Fazer check-out" },
};
