"use client";

import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VoucherFormData,
  voucherSchema,
} from "@/utils/lib/schemas/voucher-schema";
import { generateVoucherCode } from "@/utils/lib/helpers/voucher-generate";
import { Resolver } from "react-hook-form";
export function useVoucherForm(): UseFormReturn<VoucherFormData> {
  const form = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema) as Resolver<VoucherFormData>,
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

  useEffect(() => {
    const raw = sessionStorage.getItem("voucher_draft");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        form.reset(parsed);
      } catch (e) {
        console.error("Falha ao carregar rascunho de voucher", e);
      } finally {
        sessionStorage.removeItem("voucher_draft");
      }
    }
  }, [form]);

  const watchTotal = form.watch("total");
  const watchEntrada = form.watch("entrada");

  useEffect(() => {
    const newRestante = (watchTotal || 0) - (watchEntrada || 0);
    form.setValue("restante", newRestante >= 0 ? newRestante : 0);
  }, [watchTotal, watchEntrada, form]);

  return form;
}
