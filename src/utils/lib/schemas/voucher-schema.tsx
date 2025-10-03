import * as z from "zod";
import { generateVoucherCode } from "../helpers/voucher-generate";

export const voucherItemSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  data: z.string().optional(),
  hora: z.string().optional(),
});

export const passageiroSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().optional(),
  colo: z.boolean().default(false),
});

export const voucherSchema = z.object({
  codigo: z.string().default(() => generateVoucherCode()),
  vendedor: z.string(),
  contratante: z.string(),
  telefone: z.string().optional().default(""),
  embarque: z.string().optional().default(""),
  itens: z
    .array(voucherItemSchema)
    .default([{ descricao: "", data: "", hora: "" }]),
  passageiros: z
    .array(passageiroSchema)
    .default([{ nome: "", telefone: "", colo: false }]),
  total: z.number().default(0),
  entrada: z.number().default(0),
  restante: z.number().default(0),
  observacoes: z.string().optional().default(""),
});

export type VoucherFormData = z.infer<typeof voucherSchema>;
