"use client";

import { useState, useEffect, useCallback } from "react";

import type { Reservation } from "@/types/Reservation";
import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";

export function useReservations(searchTerm = "") {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("reservations")
      .select("*, operators(name), sellers(name)")
      .order("created_at", { ascending: false });

    if (searchTerm) {
      query = query.or(
        `code.ilike.%${searchTerm}%,contractor_name.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      Toast.Base({
        title: "Erro no ao busca reserva",
        description: error.message,
        variant: "error",
      });
      setReservations([]);
    } else {
      setReservations(data || []);
    }

    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const deleteReservation = async (id: string) => {
    const { error: passengersError } = await supabase
      .from("passengers")
      .delete()
      .eq("reservation_id", id);

    if (passengersError) {
      Toast.Base({
        title: "Erro ao deletar passageiros",
        description: "error ao deletar",
        variant: "error",
      });
      return false;
    }
    const { error: itemsError } = await supabase
      .from("reservation_items")
      .delete()
      .eq("reservation_id", id);

    if (itemsError) {
      Toast.Base({
        title: "Error ao deletar item",
        description: "error ao deletar",
        variant: "error",
      });
      return false;
    }

    const { error } = await supabase.from("reservations").delete().eq("id", id);

    if (error) {
      Toast.Base({
        title: "Erro no processo",
        description: error.message,
        variant: "error",
      });
      return false;
    }

    Toast.Base({
      title: "Reserva deletada",
      description: "A reserva foi removida com sucesso.",
      variant: "error",
    });

    fetchReservations();
    return true;
  };

  return {
    reservations,
    loading,
    fetchReservations,
    deleteReservation,
  };
}
