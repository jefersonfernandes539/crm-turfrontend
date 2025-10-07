import { supabase } from "@/services/supabaseClient";

interface VoucherPayload {
  codigo: string;
  cliente_nome: string;
  telefone?: string;
  hotel?: string;
  valor_total_centavos: number;
  entrada_centavos: number;
  restante_centavos: number;
  obs?: string;
  status: "EMITIDO" | "RASCUNHO" | "CANCELADO";
  operator_name?: string;
  seller_name?: string;
  issued_at?: string;
  payload?: any;
}

export async function duplicateVoucherWithItems(
  originalVoucherId: string,
  newVoucherData: VoucherPayload
) {
  try {
    // 1️⃣ Criar novo voucher
    const { data: newVoucher, error: voucherError } = await supabase
      .from("vouchers")
      .insert(newVoucherData)
      .select()
      .single();

    if (voucherError) throw voucherError;

    const newVoucherId = newVoucher.id;

    // 2️⃣ Pegar itens do voucher original
    const { data: originalItems, error: itemsError } = await supabase
      .from("voucher_itens")
      .select("*")
      .eq("voucher_id", originalVoucherId);

    if (itemsError) throw itemsError;

    // 3️⃣ Criar novos itens para o novo voucher
    const newItems = originalItems.map((item: any) => ({
      voucher_id: newVoucherId,
      descricao: item.descricao,
      data: item.data,
      hora: item.hora,
      ordem: item.ordem,
      observacoes: item.observacoes,
    }));

    if (newItems.length > 0) {
      const { error: insertItemsError } = await supabase
        .from("voucher_itens")
        .insert(newItems);

      if (insertItemsError) throw insertItemsError;
    }

    return newVoucher;
  } catch (error) {
    console.error("Erro ao duplicar voucher:", error);
    throw error;
  }
}
