"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { useVoucherData } from "@/hooks/use-voucher-data";

import { GeneralInfoSection } from "../../../voucher/components/general-info-section";
import { ItemsSection } from "../../../voucher/components/items-section";
import { PaymentSection } from "../../../voucher/components/payment-section";
import { PassengersSection } from "../../../voucher/components/passengers-section";
import { FormActions } from "../../../voucher/components/form-actions";

import { VoucherFormData } from "@/types/Voucher";
import { supabase } from "@/services/supabaseClient";
import {
  createDemoVoucherData,
  generateUniqueCode,
} from "@/utils/lib/helpers/voucher-utils";
import { Toast } from "@/components";
import { gerarVoucherPDF } from "@/utils/lib/pdf/download";

interface VoucherFormProps {
  initialData?: Partial<VoucherFormData>;
  voucherId?: string;
}

export function VoucherForm({ initialData, voucherId }: VoucherFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const { operators, sellers, pricebook, fetchPricebook } = useVoucherData();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VoucherFormData>({
    defaultValues: initialData || {
      codigo: "",
      contratante: "",
      telefone: "",
      embarque: "",
      operadora: "",
      vendedor: "",
      itens: [{ descricao: "", data: "", hora: "", observacoes: "" }],
      passageiros: [{ nome: "", telefone: "", colo: false }],
      total: 0,
      entrada: 0,
      observacoes: "",
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control, name: "itens" });
  const {
    fields: passengerFields,
    append: appendPassenger,
    remove: removePassenger,
  } = useFieldArray({ control, name: "passageiros" });

  const selectedOperatorId = watch("operadora") ?? "";

  useEffect(() => {
    if (!voucherId) {
      generateUniqueCode().then((code: string) => setValue("codigo", code));
    }
  }, [voucherId, setValue]);

  useEffect(() => {
    const fromReservation = searchParams.get("fromReservation");
    const raw = localStorage.getItem("voucher_draft");

    if (fromReservation && raw) {
      try {
        const draft = JSON.parse(raw);
        reset(draft);
      } catch (e) {
        console.error("Failed to parse voucher draft:", e);
      } finally {
        localStorage.removeItem("voucher_draft");
      }
    } else if (initialData) {
      reset(initialData);
    }
  }, [initialData, searchParams, reset]);

  useEffect(() => {
    fetchPricebook(selectedOperatorId);
  }, [selectedOperatorId, fetchPricebook]);

  const handleSaveAndGenerate = async (data: VoucherFormData) => {
    setGeneratingPdf(true);

    const total =
      typeof data.total === "string" ? parseFloat(data.total) : data.total ?? 0;
    const entrada =
      typeof data.entrada === "string"
        ? parseFloat(data.entrada)
        : data.entrada ?? 0;
    const operator = operators.find((op: any) => op.id === data.operadora);

    const voucherPayload = {
      ...data,
      total,
      entrada,
      restante: Math.max(total - entrada, 0),
      operadora: operator?.name || "N/A",
    };

    const voucherHeader = {
      codigo: data.codigo,
      cliente_nome: data.contratante,
      telefone: data.telefone,
      hotel: data.embarque,
      seller_name: data.vendedor,
      operator_name: operator?.name || "N/A",
      valor_total_centavos: Math.round(total * 100),
      entrada_centavos: Math.round(entrada * 100),
      restante_centavos: Math.round(Math.max(total - entrada, 0) * 100),
      obs: data.observacoes,
      status: "EMITIDO",
      issued_at: new Date().toISOString(),
      payload: voucherPayload,
    };

    try {
      let savedHeader;
      if (voucherId) {
        const { data, error } = await supabase
          .from("vouchers")
          .update(voucherHeader)
          .eq("id", voucherId)
          .select()
          .single();
        if (error) throw error;
        savedHeader = data;
      } else {
        const { data, error } = await supabase
          .from("vouchers")
          .insert(voucherHeader)
          .select()
          .single();
        if (error) throw error;
        savedHeader = data;
      }

      const currentVoucherId = savedHeader.id;

      await supabase
        .from("voucher_itens")
        .delete()
        .eq("voucher_id", currentVoucherId);

      const itemsToSave = data.itens
        .filter((i: any) => i.descricao)
        .map((item: any) => ({
          ...item,
          voucher_id: currentVoucherId,
          hora: item.hora || null,
        }));

      if (itemsToSave.length > 0) {
        const { error: itemsError } = await supabase
          .from("voucher_itens")
          .insert(itemsToSave);
        if (itemsError) throw itemsError;
      }

      Toast.Base({
        title: "Voucher salvo! Gerando PDF...",
        description: "salvando voucher",
        variant: "success",
      });
      await gerarVoucherPDF(voucherPayload);
      router.push("/voucher");
    } catch (error: any) {
      console.error("Erro no processo de salvar e gerar voucher:", error);

      Toast.Base({
        title: "Erro no processo",
        description: error.message,
        variant: "error",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleGenerateDemoPdf = async () => {
    setGeneratingPdf(true);
    const demoPayload = createDemoVoucherData();

    try {
      await gerarVoucherPDF(demoPayload);
    } catch (pdfError: any) {
      Toast.Base({
        title: "Erro ao gerar PDF de demonstração",
        description: pdfError.message,
        variant: "error",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSaveAndGenerate)} className="space-y-6">
      <GeneralInfoSection
        register={register}
        control={control}
        errors={errors}
        operators={operators}
        sellers={sellers}
      />

      <ItemsSection
        register={register}
        control={control}
        errors={errors}
        itemFields={itemFields}
        appendItem={appendItem}
        removeItem={removeItem}
        pricebook={pricebook}
        selectedOperatorId={selectedOperatorId}
      />

      <PassengersSection
        register={register}
        control={control}
        errors={errors}
        passengerFields={passengerFields}
        appendPassenger={appendPassenger}
        removePassenger={removePassenger}
      />

      <PaymentSection register={register} watch={watch} />

      <FormActions
        onGenerateDemo={handleGenerateDemoPdf}
        isGeneratingPdf={generatingPdf}
        isLoading={loading}
        isEditing={!!voucherId}
      />
    </form>
  );
}
