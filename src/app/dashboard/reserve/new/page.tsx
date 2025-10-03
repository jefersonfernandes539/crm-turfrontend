"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Save, Send, AlertCircle } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";
import ReservationInfoForm from "./components/reservation-info-form";
import PassengersForm from "./components/passengers-form";
import ItemsForm from "./components/items-form";
import TotalsDisplay from "./components/totals-display";

import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";
import eventBus from "@/utils/lib/helpers/eventBus";
import { parseCurrency } from "@/utils/lib/helpers/formatCurrency";
import {
  genCode,
  reservationSchema,
} from "@/utils/lib/schemas/reservation-schema";

const NovaReserva = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [pricebooks, setPricebooks] = useState<any[]>([]);
  const [savedReservation, setSavedReservation] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      code: genCode(),
      entry_value_str: "0,00",
      passengers: [{ name: "", phone: "", is_infant: false }],
      items: [],
    },
  });

  const watchedItems = watch("items");
  const watchedEntryValue = watch("entry_value_str");
  const debouncedEntryValue = useDebounce(watchedEntryValue, 300);
  const selectedOperatorId = watch("operator_id");

  useEffect(() => {
    const fetchOperators = async () => {
      const { data, error } = await supabase
        .from("operators")
        .select("id, name, whatsapp")
        .eq("active", true)
        .eq("type", "OPERADORA")
        .order("name");

      if (error) {
        Toast.Base({
          variant: "error",
          title: "Erro ao buscar operadoras!",
          description: "Ocorreu um erro na busca.",
        });
      } else {
        setOperators(data || []);
      }
    };
    fetchOperators();
  }, []);

  // Buscar vendedores
  useEffect(() => {
    const fetchSellers = async () => {
      const { data, error } = await supabase
        .from("sellers") // ajuste para a tabela correta
        .select("id, name")
        .eq("active", true)
        .order("name");

      if (error) {
        Toast.Base({
          variant: "error",
          title: "Erro ao buscar vendedores!",
          description: "Ocorreu um erro ao buscar os vendedores.",
        });
      } else {
        setSellers(data || []);
      }
    };
    fetchSellers();
  }, []);

  // Buscar pricebooks
  const fetchPricebooks = useCallback(
    async (operatorId?: string) => {
      if (!operatorId) {
        setPricebooks([]);
        setValue("items", []);
        return;
      }

      const { data, error } = await supabase
        .from("pricebook")
        .select("id, name, net")
        .eq("partner_id", operatorId)
        .eq("active", true);

      if (error) {
        Toast.Base({
          variant: "error",
          title: "Erro ao buscar passeios da operadora!",
          description: "Ocorreu um erro ao buscar os passeios da operadora.",
        });
        setPricebooks([]);
      } else {
        const formatted = (data || []).map((pb) => ({
          ...pb,
          category: pb.name.toLowerCase().includes("transfer")
            ? "TRANSFER"
            : "TOUR",
          pricebook_id: pb.id,
        }));
        setPricebooks(formatted);
      }
    },
    [setValue]
  );

  useEffect(() => {
    fetchPricebooks(selectedOperatorId);
    setValue("code", genCode());
  }, [selectedOperatorId, fetchPricebooks, setValue]);

  useEffect(() => {
    const handlePricebookUpdate = (partnerId: string) => {
      if (partnerId === selectedOperatorId) {
        Toast.Base({
          title: "Lista de passeios atualizada!",
          variant: "success",
          description: "Lista atualizada com sucesso.",
        });
        fetchPricebooks(partnerId);
      }
    };
    eventBus.on("pricebook:updated", handlePricebookUpdate);
    return () => eventBus.off("pricebook:updated", handlePricebookUpdate);
  }, [selectedOperatorId, fetchPricebooks]);

  // Totais
  const totalItensNET = useMemo(
    () =>
      watchedItems.reduce(
        (acc: number, item: any) =>
          acc + item.net * item.qty * (item.transfer_multiplier || 1),
        0
      ),
    [watchedItems]
  );

  const entryValueCents = useMemo(
    () => parseCurrency(debouncedEntryValue ?? "0"),
    [debouncedEntryValue]
  );

  const valorRestante = useMemo(
    () => Math.max(totalItensNET - entryValueCents / 100, 0),
    [totalItensNET, entryValueCents]
  );

  const onSubmit = async (data: any) => {
    setLoading(true);

    if (totalItensNET <= 0) {
      Toast.Base({
        variant: "error",
        title: "Valor total zerado",
        description: "A reserva deve ter um valor maior que zero.",
      });
      setLoading(false);
      return;
    }

    // lógica de insert permanece aqui
    setLoading(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 max-w-6xl mx-auto px-4 pb-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur z-10 py-4 border-b">
          <div>
            <h1 className="text-3xl font-bold">📝 Nova Reserva</h1>
            <p className="text-muted-foreground text-sm">
              Preencha os dados para criar uma nova reserva.
            </p>
          </div>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Salvar Reserva
          </Button>
        </div>

        {Object.keys(errors).length > 0 && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <div>
                <CardTitle className="text-destructive">
                  Campos Incorretos
                </CardTitle>
                <CardDescription className="text-destructive/80">
                  Corrija os campos destacados em vermelho.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReservationInfoForm
            control={control}
            register={register}
            errors={errors}
            operators={operators}
            sellers={sellers}
          />

          <PassengersForm
            control={control}
            register={register}
            errors={errors}
          />
        </div>

        <ItemsForm
          control={control}
          register={register}
          errors={errors}
          pricebooks={pricebooks}
          selectedOperatorId={selectedOperatorId}
          watch={watch}
          setValue={setValue}
        />

        <TotalsDisplay
          register={register}
          totalItensNET={totalItensNET}
          valorRestante={valorRestante}
        />
      </form>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Reserva criada com sucesso!</DialogTitle>
            <DialogDescription>
              A reserva <strong>{savedReservation?.code}</strong> foi
              registrada. Deseja enviar para a operadora via WhatsApp?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/reservas/lista")}
            >
              Voltar para Reservas
            </Button>
            <Button onClick={() => {}}>
              <Send className="mr-2 h-4 w-4" /> Enviar via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NovaReserva;
