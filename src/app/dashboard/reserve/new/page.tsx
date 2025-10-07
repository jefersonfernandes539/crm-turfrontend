"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components";
import { supabase } from "@/services/supabaseClient";

import {
  reservationSchema,
  ReservationFormValues,
  genCode,
} from "@/utils/lib/schemas/reservation-schema";
import ReservationInfoForm from "./components/reservation-info-form";
import PassengersForm from "./components/passengers-form";
import ItemsForm from "./components/items-form";
import TotalsDisplay from "./components/totals-display";

const NovaReserva = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [pricebooks, setPricebooks] = useState<any[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      code: genCode(),
      contractor_name: "",
      embark_place: "",
      date: "",
      entry_value_str: "0,00",
      entry_value: 0,
      total_items_net: 0,
      remaining: 0,
      passengers: [{ name: "", phone: "", is_infant: false }],
      items: [],
    },
  });

  const selectedOperatorId = watch("operator_id");

  const fetchOperators = useCallback(async () => {
    const { data, error } = await supabase
      .from("operators")
      .select("id, name")
      .eq("active", true)
      .eq("type", "OPERADORA")
      .order("name");

    if (error)
      return Toast.Base({
        variant: "error",
        title: "Erro ao buscar operadoras",
        description: error.message,
      });

    setOperators(data || []);
  }, []);

  const fetchSellers = useCallback(async () => {
    const { data, error } = await supabase
      .from("sellers")
      .select("id, name")
      .eq("active", true)
      .order("name");

    if (error)
      return Toast.Base({
        variant: "error",
        title: "Erro ao buscar vendedores",
        description: error.message,
      });

    setSellers(data || []);
  }, []);

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

      if (error)
        return Toast.Base({
          variant: "error",
          title: "Erro ao buscar passeios",
          description: error.message,
        });

      const formatted = (data || []).map((pb) => ({
        ...pb,
        category: pb.name.toLowerCase().includes("transfer")
          ? "TRANSFER"
          : "TOUR",
        pricebook_id: pb.id,
      }));

      setPricebooks(formatted);
    },
    [setValue]
  );

  useEffect(() => {
    fetchOperators();
    fetchSellers();
  }, [fetchOperators, fetchSellers]);

  useEffect(() => {
    fetchPricebooks(selectedOperatorId);
    setValue("code", genCode());
  }, [selectedOperatorId, fetchPricebooks, setValue]);

  const onSubmit = async (data: ReservationFormValues) => {
    try {
      setLoading(true);

      const { data: reservationData, error: reservationError } = await supabase
        .from("reservations")
        .insert([
          {
            code: data.code,
            contractor_name: data.contractor_name,
            embark_place: data.embark_place,
            date: data.date,
            entry_value: Math.round(data.entry_value),
            total_items_net: Math.round(data.total_items_net),
            remaining: Math.round(data.remaining),
            operator_id: data.operator_id,
            seller_id: data.seller_id,
            notes: null,
          },
        ])
        .select("id")
        .single();

      if (reservationError) throw reservationError;

      const reservationId = reservationData.id;

      const itemsPayload = data.items.map((item) => ({
        reservation_id: reservationId,
        pricebook_id: item.pricebook_id,
        name: item.name,
        category: item.category,
        date: item.date,
        qty: item.quantity,
        net: item.net,
        transfer_multiplier: item.transfer_multiplier,
        subtotal: item.quantity * item.net!,
      }));

      if (itemsPayload.length > 0) {
        const { error: itemsError } = await supabase
          .from("reservation_items")
          .insert(itemsPayload);

        if (itemsError) throw itemsError;
      }

      const passengersPayload = data.passengers.map((p) => ({
        reservation_id: reservationId,
        name: p.name,
        phone: p.phone,
        is_infant: p.is_infant ?? false,
      }));

      if (passengersPayload.length > 0) {
        const { error: passengersError } = await supabase
          .from("passengers")
          .insert(passengersPayload);

        if (passengersError) throw passengersError;
      }

      Toast.Base({
        variant: "success",
        title: "Reserva criada com sucesso!",
        description: "Todos os dados foram salvos corretamente.",
      });

      router.push("/dashboard/reserve");
    } catch (error: any) {
      Toast.Base({
        variant: "error",
        title: "Erro ao criar reserva",
        description: error.message || "Erro desconhecido.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-6xl mx-auto p-6"
    >
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">📝 Nova Reserva</h1>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          Salvar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReservationInfoForm
          control={control}
          register={register}
          errors={errors}
          operators={operators}
          sellers={sellers}
        />
        <PassengersForm control={control} register={register} errors={errors} />
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

      <TotalsDisplay control={control} setValue={setValue} />
    </form>
  );
};

export default NovaReserva;
