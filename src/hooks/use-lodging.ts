"use client";

import { useCallback, useEffect, useState } from "react";

import { db } from "@/services/db";
import { Toast } from "@/components";
import type {
  LodgingStay,
  LodgingStayInput,
  LodgingStayStatus,
  LodgingUnit,
  LodgingUnitInput,
} from "@/types/Lodging";
import { todayISO } from "@/utils/lodging";

const notifyError = (title: string, message: string) =>
  Toast.Base({ title, description: message, variant: "error" });

const notifySuccess = (title: string, message: string) =>
  Toast.Base({ title, description: message, variant: "success" });

/* ------------------------------------------------------------------ */
/* Acomodações                                                         */
/* ------------------------------------------------------------------ */

export function useLodgingUnits({ onlyActive = false } = {}) {
  const [units, setUnits] = useState<LodgingUnit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    let query = db
      .from("lodging_units")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (onlyActive) query = query.eq("active", true);

    const { data, error } = await query;
    if (error) {
      notifyError("Erro ao buscar acomodações", error.message);
      setUnits([]);
    } else {
      setUnits((data as LodgingUnit[]) || []);
    }
    setLoading(false);
  }, [onlyActive]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const saveUnit = async (input: LodgingUnitInput, id?: string) => {
    const { error } = id
      ? await db.from("lodging_units").update(input).eq("id", id)
      : await db.from("lodging_units").insert(input);

    if (error) {
      notifyError("Erro ao salvar acomodação", error.message);
      return false;
    }
    notifySuccess(
      id ? "Acomodação atualizada" : "Acomodação criada",
      `${input.name} foi salva com sucesso.`
    );
    fetchUnits();
    return true;
  };

  const deleteUnit = async (id: string) => {
    const { error } = await db.from("lodging_units").delete().eq("id", id);
    if (error) {
      notifyError(
        "Não foi possível excluir",
        error.code === "23503" || error.code === "23001"
          ? "Essa acomodação possui estadias. Desative-a em vez de excluir."
          : error.message
      );
      return false;
    }
    notifySuccess("Acomodação excluída", "A acomodação foi removida.");
    fetchUnits();
    return true;
  };

  return { units, loading, fetchUnits, saveUnit, deleteUnit };
}

/* ------------------------------------------------------------------ */
/* Estadias                                                            */
/* ------------------------------------------------------------------ */

type StaysFilter = {
  /** Estadias que tocam o intervalo [from, to] */
  from?: string;
  to?: string;
  search?: string;
  status?: LodgingStayStatus | "all";
};

export function useLodgingStays(filter: StaysFilter = {}) {
  const { from, to, search, status } = filter;
  const [stays, setStays] = useState<LodgingStay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStays = useCallback(async () => {
    setLoading(true);
    let query = db
      .from("lodging_stays")
      .select("*, lodging_units(name, type), sellers(name)")
      .order("check_in", { ascending: false });

    if (from) query = query.gte("check_out", from);
    if (to) query = query.lte("check_in", to);
    if (status && status !== "all") query = query.eq("status", status);
    if (search?.trim()) {
      const term = search.trim().replace(/[,()]/g, " ");
      query = query.or(
        `guest_name.ilike.%${term}%,code.ilike.%${term}%,guest_phone.ilike.%${term}%,guest_document.ilike.%${term}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      notifyError("Erro ao buscar estadias", error.message);
      setStays([]);
    } else {
      setStays((data as LodgingStay[]) || []);
    }
    setLoading(false);
  }, [from, to, search, status]);

  useEffect(() => {
    fetchStays();
  }, [fetchStays]);

  const saveStay = async (input: LodgingStayInput, id?: string) => {
    const { error } = id
      ? await db.from("lodging_stays").update(input).eq("id", id)
      : await db.from("lodging_stays").insert(input);

    if (error) {
      // Mensagens do trigger de disponibilidade chegam legíveis
      notifyError("Erro ao salvar estadia", error.message);
      return false;
    }
    notifySuccess(
      id ? "Estadia atualizada" : "Estadia criada",
      `Hospedagem de ${input.guest_name} salva.`
    );
    fetchStays();
    return true;
  };

  const updateStatus = async (stay: LodgingStay, next: LodgingStayStatus) => {
    const patch: Partial<LodgingStay> = { status: next };
    const today = todayISO();

    if (next === "checked_in") patch.checked_in_at = new Date().toISOString();
    if (next === "checked_out") {
      patch.checked_out_at = new Date().toISOString();
      // Saída antecipada libera as noites restantes no mapa
      if (today > stay.check_in && today < stay.check_out) {
        patch.check_out = today;
      }
    }

    const { error } = await db
      .from("lodging_stays")
      .update(patch)
      .eq("id", stay.id);

    if (error) {
      notifyError("Erro ao atualizar status", error.message);
      return false;
    }
    fetchStays();
    return true;
  };

  const deleteStay = async (id: string) => {
    const { error } = await db.from("lodging_stays").delete().eq("id", id);
    if (error) {
      notifyError("Erro ao excluir estadia", error.message);
      return false;
    }
    notifySuccess("Estadia excluída", "A estadia foi removida.");
    fetchStays();
    return true;
  };

  return { stays, loading, fetchStays, saveStay, updateStatus, deleteStay };
}

/* ------------------------------------------------------------------ */
/* Vendedores (para vincular comissão à estadia)                       */
/* ------------------------------------------------------------------ */

export function useSellerOptions() {
  const [sellers, setSellers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    db
      .from("sellers")
      .select("id, name")
      .order("name")
      .then(({ data }) => setSellers(data || []));
  }, []);

  return sellers;
}
