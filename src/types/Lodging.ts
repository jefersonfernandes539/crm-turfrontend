export type LodgingUnitType =
  | "private_room"
  | "dorm"
  | "camping_tent"
  | "camping_rv"
  | "cabin"
  | "glamping"
  | "other";

/** exclusive: um grupo por vez · shared: vendido por pessoa/cama até a capacidade */
export type LodgingBookingMode = "exclusive" | "shared";

export type LodgingPriceMode = "per_unit" | "per_person";

export type LodgingStayStatus =
  | "reserved"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export interface LodgingUnit {
  id: string;
  name: string;
  type: LodgingUnitType;
  booking_mode: LodgingBookingMode;
  capacity: number;
  price_mode: LodgingPriceMode;
  nightly_rate: number;
  description?: string | null;
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface LodgingStay {
  id: string;
  code: string;
  unit_id: string;
  guest_name: string;
  guest_phone?: string | null;
  guest_document?: string | null;
  /** YYYY-MM-DD */
  check_in: string;
  /** YYYY-MM-DD (dia da saída, não conta como diária) */
  check_out: string;
  adults: number;
  children: number;
  vehicle_plate?: string | null;
  status: LodgingStayStatus;
  nightly_rate: number;
  total: number;
  paid_amount: number;
  seller_id?: string | null;
  source?: string | null;
  notes?: string | null;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  created_at?: string;
  updated_at?: string;
  lodging_units?: Pick<LodgingUnit, "name" | "type"> | null;
  sellers?: { name: string } | null;
}

export type LodgingUnitInput = Omit<
  LodgingUnit,
  "id" | "created_at" | "updated_at"
>;

export type LodgingStayInput = Omit<
  LodgingStay,
  | "id"
  | "code"
  | "created_at"
  | "updated_at"
  | "lodging_units"
  | "sellers"
  | "checked_in_at"
  | "checked_out_at"
>;
