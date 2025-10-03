import { z } from "zod";

export const reservationSchema = z.object({
  code: z.string(),
  entry_value_str: z.string().default("0,00"),
  operator_id: z.string().optional(),
  passengers: z.array(
    z.object({
      name: z.string().min(1, "Nome obrigatório"),
      phone: z.string().optional(), // 👈 adicionado
      is_infant: z.boolean().default(false), // 👈 adicionado
    })
  ),
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number().int(),
    })
  ),
  total: z.number().optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

export function genCode(): string {
  return "RSV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}
