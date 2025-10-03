import { supabase } from "@/services/supabaseClient";
import { Toast } from "@/components";

export const getSellerOptions = async (search = ""): Promise<string[]> => {
  try {
    let query = supabase
      .from("sellers")
      .select("name")
      .order("name", { ascending: true });

    if (search.trim()) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      Toast.Base({
        variant: "error",
        title: "Erro ao buscar vendedores",
        description: error.message,
      });
      return [];
    }

    return data?.map((v) => v.name) || [];
  } catch (err: any) {
    Toast.Base({
      variant: "error",
      title: "Erro ao buscar vendedores",
      description: err.message,
    });
    return [];
  }
};
