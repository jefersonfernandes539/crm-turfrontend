import { z } from "zod";

export const reservationItemSchema = z.object({
  id: z.string().optional(),
  pricebook_id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  date: z.string().min(1, "Data obrigatória"),
  quantity: z.number().int().positive("Qtd deve ser maior que 0"),
  net: z.number().min(0, "Valor inválido"),
  transfer_multiplier: z.number().int().min(1).default(1),
  subtotal: z.number().min(0).default(0),
});

export const passengerSchema = z.object({
  id: z.string().optional(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  is_infant: z.boolean(),
});

export const reservationSchema = z.object({
  code: z.string(),
  contractor_name: z.string().min(1, "Nome do contratante obrigatório"),
  embark_place: z.string().min(1, "Local de embarque obrigatório"),
  date: z.string().min(1, "Data obrigatória"),
  entry_value_str: z.string(),
  entry_value: z.number(),
  total_items_net: z.number(),
  remaining: z.number(),
  operator_id: z.string().uuid("Operadora obrigatória"),
  seller_id: z.string().uuid("Vendedor obrigatório"),
  passengers: z
    .array(passengerSchema),
  items: z.array(reservationItemSchema).nonempty("Adicione pelo menos 1 item"),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;
export type ReservationItemForm = z.infer<typeof reservationItemSchema>;
export type PassengerForm = z.infer<typeof passengerSchema>;

export const genCode = () => {
  const ts = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BTJR${ts}${rand}`;
};
