export interface Reservation {
  id: string;
  code: string;
  contractor_name: string;
  contractor_phone: string;
  date: string;
  operator_id: string;
  seller_id: string;
  total_items_net: number;
  down_payment: number;
  remaining_amount: number;
  observations?: string;
  created_at: string;
  updated_at: string;
  operators?: {
    name: string;
  };
  sellers?: {
    name: string;
  };
}

export interface ReservationItem {
  id: string;
  reservation_id: string;
  description: string;
  date: string;
  time: string;
  observations?: string;
  created_at: string;
}

export interface Passenger {
  id: string;
  reservation_id: string;
  name: string;
  phone?: string;
  is_lap_child: boolean;
  created_at: string;
}

export interface ReservationWithDetails extends Reservation {
  items: ReservationItem[];
  passengers: Passenger[];
}
