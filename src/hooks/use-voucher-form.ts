"use client";

import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VoucherFormData,
  voucherSchema,
} from "@/utils/lib/schemas/voucher-schema";
import { generateVoucherCode } from "@/utils/lib/helpers/voucher-generate";

export function useVoucherForm(): UseFormReturn<VoucherFormData> {
  const form = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      codigo: generateVoucherCode(),
      vendedor: "",
      contratante: "",
      telefone: "",
      embarque: "",
      itens: [{ descricao: "", data: "", hora: "" }],
      passageiros: [{ nome: "", telefone: "", colo: false }],
      total: 0,
      entrada: 0,
      restante: 0,
      observacoes: "",
    },
  });

  // Carregar rascunho do localStorage ao montar
  useEffect(() => {
    const raw = localStorage.getItem("voucher_draft");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        form.reset(parsed);
      } catch (e) {
        console.error("Falha ao carregar rascunho de voucher", e);
      } finally {
        localStorage.removeItem("voucher_draft");
      }
    }
  }, [form]);

  // Recalcula automaticamente o restante
  const watchTotal = form.watch("total");
  const watchEntrada = form.watch("entrada");

  useEffect(() => {
    const newRestante = (watchTotal || 0) - (watchEntrada || 0);
    form.setValue("restante", newRestante >= 0 ? newRestante : 0);
  }, [watchTotal, watchEntrada, form]);

  return form;
}
