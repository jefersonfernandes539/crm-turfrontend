"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import {
  passengerSchema,
  reservationItemSchema,
  reservationSchema,
  ReservationFormValues,
} from "@/utils/lib/schemas/reservation-schema";
import { FormResevation } from "../voucher-reservation";

interface VoucherFromReservationProps {
  reservationId: string;
}

export function VoucherFromReservation({
  reservationId,
}: VoucherFromReservationProps) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<ReservationFormValues | null>(
    null
  );

  useEffect(() => {
    if (!reservationId) return;

    const fetchReservation = async () => {
      setLoading(true);
      try {
        const { data: reservation, error: resError } = await supabase
          .from("reservations")
          .select(
            `id, code, contractor_name, embark_place, date,
             entry_value, total_items_net, remaining,
             operator_id, seller_id`
          )
          .eq("id", reservationId)
          .single();

        if (resError) throw resError;
        if (!reservation) throw new Error("Reserva não encontrada");

        const { data: passengers } = await supabase
          .from("passengers")
          .select("id, name, phone, is_infant")
          .eq("reservation_id", reservationId);

        const { data: items } = await supabase
          .from("reservation_items")
          .select(
            "id, pricebook_id, name, category, date, qty, net, transfer_multiplier, subtotal"
          )
          .eq("reservation_id", reservationId);

        const formattedData = reservationSchema.parse({
          code: reservation.code,
          contractor_name: reservation.contractor_name,
          embark_place: reservation.embark_place,
          date: reservation.date?.toString() || "",
          entry_value_str: (reservation.entry_value ?? 0).toFixed(2),
          entry_value: reservation.entry_value ?? 0,
          total_items_net: reservation.total_items_net ?? 0,
          remaining: reservation.remaining ?? 0,
          operator_id: reservation.operator_id,
          seller_id: reservation.seller_id,
          passengers: (passengers ?? []).map((p: any) =>
            passengerSchema.parse({
              id: p.id,
              name: p.name,
              phone: p.phone,
              is_infant: p.is_infant,
            })
          ),
          items: (items ?? []).map((i: any) =>
            reservationItemSchema.parse({
              id: i.id,
              pricebook_id: i.pricebook_id,
              name: i.name,
              category: i.category ?? "",
              date: i.date ? i.date.toString() : "",
              quantity: i.qty,
              net: Number(i.net ?? 0),
              transfer_multiplier: i.transfer_multiplier ?? 1,
              subtotal: i.subtotal ?? 0,
            })
          ),
        });

        setInitialData(formattedData);
      } catch (error: any) {
        console.error("Erro ao carregar reserva:", error);
        Toast.Base({
          title: "Erro ao carregar reserva",
          description: error.message || "Não foi possível carregar os dados.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        Carregando reserva...
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
        Nenhuma reserva encontrada.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-xl sm:text-2xl font-semibold text-foreground">
        Criar Voucher - Reserva {initialData.code}
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-4">
        <FormResevation initialData={initialData} />
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-4">
        <h3 className="font-semibold text-foreground mb-2">Passageiros</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-muted/10 text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Telefone</th>
                <th className="px-3 py-2">Colo</th>
              </tr>
            </thead>
            <tbody>
              {initialData.passengers.map((p) => (
                <tr key={p.id} className="border-b border-muted/20">
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{p.phone || "—"}</td>
                  <td className="px-3 py-2">{p.is_infant ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-4">
        <h3 className="font-semibold text-foreground mb-2">Itens da Reserva</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-muted/10 text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Quantidade</th>
                <th className="px-3 py-2">Valor Unit.</th>
                <th className="px-3 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {initialData.items.map((i) => (
                <tr key={i.id} className="border-b border-muted/20">
                  <td className="px-3 py-2">{i.name}</td>
                  <td className="px-3 py-2">{i.category}</td>
                  <td className="px-3 py-2">{i.quantity}</td>
                  <td className="px-3 py-2">R${i.net.toFixed(2)}</td>
                  <td className="px-3 py-2">R${i.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
