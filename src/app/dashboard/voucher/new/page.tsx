"use client";

import { useState, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { useSearchParams } from "next/navigation";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { gerarVoucherPDF } from "@/utils/lib/pdf/generateVoucherpdf";
import { useVoucherForm } from "@/hooks/use-voucher-form";
import { VoucherFormData } from "@/utils/lib/schemas/voucher-schema";

import { GeneralInfoCard } from "./components/general-info-card";
import { ClientInfoCard } from "./components/client-info-card";
import { ItemsCard } from "./components/items-card";
import { PassengersCard } from "./components/passengers-card";
import { PaymentCard } from "./components/payment-card";
import { supabase } from "@/services/supabaseClient";

export default function NewVoucherPage() {
  const searchParams = useSearchParams();
  const voucherId = searchParams.get("voucherId");

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingVoucher, setLoadingVoucher] = useState(true);

  const form = useVoucherForm();
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "itens" });
  const {
    fields: passageiroFields,
    append: appendPassageiro,
    remove: removePassageiro,
  } = useFieldArray({ control: form.control, name: "passageiros" });

  useEffect(() => {
    if (!voucherId) {
      setLoadingVoucher(false);
      return;
    }

    const fetchVoucher = async () => {
      try {
        const { data, error } = await supabase
          .from("vouchers")
          .select("*")
          .eq("id", voucherId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Voucher não encontrado");

        const voucherData: VoucherFormData = {
          codigo: data.codigo,
          vendedor: data.vendedor || data.seller_name || "",
          contratante: data.contratante || data.cliente_nome || "",
          telefone: data.telefone || "",
          embarque: data.embarque || data.hotel || "",
          itens: data.itens || [],
          passageiros: data.passageiros || [],
          total: data.total || 0,
          entrada: data.entrada || 0,
          restante: data.restante || 0,
          observacoes: data.observacoes || data.obs || "",
        };

        form.reset(voucherData);
      } catch (err) {
        console.error("Erro ao carregar voucher:", err);
        alert("Erro ao carregar voucher. Veja o console.");
      } finally {
        setLoadingVoucher(false);
      }
    };

    fetchVoucher();
  }, [voucherId, form]);

  const onSubmit = async (values: VoucherFormData) => {
    setIsGenerating(true);
    try {
      await gerarVoucherPDF(values);
      alert("Voucher gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar voucher. Veja o console para detalhes.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingVoucher) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerador de Voucher Manual
        </h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados abaixo para gerar um voucher em PDF
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <GeneralInfoCard control={form.control} />
          <ClientInfoCard control={form.control} />
          <ItemsCard
            control={form.control}
            fields={itemFields}
            append={appendItem}
            remove={removeItem}
          />
          <PassengersCard
            control={form.control}
            fields={passageiroFields}
            append={appendPassageiro}
            remove={removePassageiro}
          />
          <PaymentCard control={form.control} />

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Limpar Formulário
            </Button>
            <Button type="submit" disabled={isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Gerar e Baixar Voucher
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
