"use client";

import { useState, useEffect, useCallback } from "react";
import type { Operator, PricebookItem } from "@/types/Voucher";
import { supabase } from "@/services/supabaseClient";
import eventBus from "@/utils/lib/helpers/eventBus";
import { Toast } from "@/components";

export function useVoucherData() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [pricebook, setPricebook] = useState<PricebookItem[]>([]);

  const fetchPricebook = useCallback(
    async (operatorId: string) => {
      if (!operatorId) {
        setPricebook([]);
        return;
      }

      const { data, error } = await supabase
        .from("pricebook")
        .select("name, net")
        .eq("partner_id", operatorId);

      if (error) {
        Toast.Base({
          title: "Erro ao buscar passeios da operadora.",
          description: error.message,
          variant: "error",
        });
        setPricebook([]);
      } else {
        setPricebook(data || []);
      }
    },
    []
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch operators
      const { data: opData, error: opError } = await supabase
        .from("operators")
        .select("id, name")
        .eq("active", true)
        .order("name");

      if (!opError) setOperators(opData || []);

      // Fetch sellers
      const { data: sellersData, error: sellersError } = await supabase
        .from("sellers")
        .select("name")
        .eq("active", true)
        .order("name");

      if (!sellersError) {
        setSellers(sellersData?.map((s) => s.name) || []);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const handlePricebookUpdate = (partnerId: string) => {
      fetchPricebook(partnerId);
    };

    eventBus.on("pricebook:updated", handlePricebookUpdate);
    return () => eventBus.off("pricebook:updated", handlePricebookUpdate);
  }, [fetchPricebook]);

  return {
    operators,
    sellers,
    pricebook,
    fetchPricebook,
  };
}
