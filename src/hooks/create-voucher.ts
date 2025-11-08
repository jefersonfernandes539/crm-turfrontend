import { Toast } from "@/components";
import { supabase } from "@/services/supabaseClient";

export const createVoucherFromReservation = async (reservation: any) => {
  try {
    // 🔍 Buscar nome do vendedor
    let sellerName =
      reservation.seller_name ||
      reservation.seller?.name ||
      "";

    if (!sellerName && reservation.seller_id) {
      const { data: seller } = await supabase
        .from("sellers")
        .select("name")
        .eq("id", reservation.seller_id)
        .maybeSingle();

      sellerName = seller?.name || "";
    }

    const voucherData = {
      reserva_id: reservation.id,
      codigo: reservation.code,
      vendedor_id: reservation.seller_id,
      cliente_nome: reservation.contractor_name,
      telefone:
        reservation.contractor_phone ||
        reservation.phone ||
        reservation.passengers?.[0]?.phone ||
        "",
      hotel: reservation.embark_place,
      valor_total_centavos: Math.round(reservation.total_items_net * 100),
      entrada_centavos: Math.round(reservation.entry_value * 100),
      restante_centavos: Math.round(reservation.remaining * 100),
      obs: reservation.notes || "",
      status: "EMITIDO",
      emitido_em: new Date().toISOString(),
      created_at: new Date().toISOString(),
      operator_name: reservation.operator_name || "",
      seller_name: sellerName,
      payload: {
        codigo: reservation.code,
        contratante: reservation.contractor_name,
        telefone:
          reservation.contractor_phone ||
          reservation.phone ||
          reservation.passengers?.[0]?.phone ||
          "",
        embarque: reservation.embark_place,
        observacoes: reservation.notes || "",
        itens: reservation.items?.map((i: any) => ({
          descricao: i.name,
          data: i.date || "",
          hora: i.time || "",
        })) || [],
        passageiros: reservation.passengers?.map((p: any) => ({
          nome: p.name,
          telefone: p.phone,
          colo: p.is_infant || false,
        })) || [],
      },
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
