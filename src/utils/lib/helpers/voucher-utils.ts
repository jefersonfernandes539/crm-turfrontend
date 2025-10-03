import { supabase } from "@/services/supabaseClient";
import dayjs from "dayjs";

export async function generateUniqueCode(): Promise<string> {
  let code: string;

  do {
    code =
      "BTJR" +
      dayjs().format("YYYYMMDDHHmmss") +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    const { data } = await supabase
      .from("vouchers")
      .select("id")
      .eq("codigo", code)
      .limit(1);

    if (!data?.length) break;
  } while (true);

  return code;
}

export function calculateRemaining(total: number, entrada: number): number {
  return Math.max(total - entrada, 0);
}

export function createDemoVoucherData() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    codigo: `DEMO-${Date.now()}`,
    contratante: "Cliente de Demonstração",
    telefone: "(85) 99999-8888",
    embarque: "Hotel Fictício",
    operadora: "Operadora Demo",
    vendedor: "Vendedor Teste",
    itens: [
      {
        descricao: "Passeio Leste - 4x4 Privativo",
        data: today.toISOString().split("T")[0],
        hora: "09:00",
        observacoes: "Com emoção",
      },
      {
        descricao: "Transfer IN - Aeroporto x Jeri",
        data: tomorrow.toISOString().split("T")[0],
        hora: "14:30",
        observacoes: "",
      },
    ],
    passageiros: [
      { nome: "João da Silva", telefone: "(11) 98765-4321", colo: false },
      { nome: "Maria da Silva", telefone: "", colo: false },
      { nome: "Pedrinho da Silva", telefone: "", colo: true },
    ],
    total: 1250.0,
    entrada: 500.0,
    restante: 750.0,
    observacoes:
      "Este é um voucher de demonstração para teste de layout e funcionalidade. Nenhum valor comercial.",
  };
}
