import { Toast } from "@/components";
import { supabase } from "@/services/supabaseClient";

export const createVoucherFromReservation = async (reservation: any) => {
  try {
    const voucherData = {
      reserva_id: reservation.id,
      codigo: reservation.code,
      vendedor_id: reservation.seller_id,
      cliente_nome: reservation.contractor_name,
      hotel: reservation.embark_place,
      valor_total_centavos: reservation.total_items_net * 100,
      entrada_centavos: reservation.entry_value * 100,
      restante_centavos: reservation.remaining * 100,
      obs: reservation.notes || "",
      status: "EMITIDO", // inicial
      emitido_em: new Date().toISOString(),
      created_at: new Date().toISOString(),
      operator_name: "", // opcional
      seller_name: "",   // opcional
      payload: reservation, // salva a reserva inteira em JSON
    };

    const { error } = await supabase.from("vouchers").insert([voucherData]);
    if (error) throw error;

    Toast.Base({
      variant: "success",
      title: "Voucher criado!",
      description: `Voucher da reserva ${reservation.code} gerado.`,
    });
  } catch (err: any) {
    Toast.Base({
      variant: "error",
      title: "Erro ao criar voucher",
      description: err.message || "Ocorreu um erro inesperado.",
    });
  }
};
