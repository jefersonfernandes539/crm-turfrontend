import { supabase } from "@/services/supabaseClient";

export const BASE_SELLERS = [
  "Welisson",
  "Filipe",
  "Eduarda",
  "Lorin",
  "Nicolas",
  "Allisson",
];

const N = (s: string | undefined) =>
  String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .trim();

const ALIAS: Record<string, string> = {
  WELISON: "Welisson",
  WELLISON: "Welisson",
  WELISSON: "Welisson",
  LORIM: "Lorin",
  ALLISON: "Allisson",
  ALISON: "Allisson",
  ALISSON: "Allisson",
  PHILIPE: "Filipe",
};

export const canonical = (
  s: string | null | undefined,
  extraSellers: string[] = []
): string | null => {
  if (!s) return null;
  const k = N(s);
  if (ALIAS[k]) return ALIAS[k];

  const allSellers = [...BASE_SELLERS, ...extraSellers];
  const base = allSellers.find((b) => N(b) === k);
  return base ?? null;
};

export const getSellerOptions = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("sellers")
    .select("name")
    .eq("active", true);

  if (error) {
    console.error("Error fetching extra sellers:", error);
    return [...BASE_SELLERS];
  }

  const extraSellers = data?.map((s: any) => s.name) ?? [];
  const combined = [...BASE_SELLERS, ...extraSellers];

  // Deduplicate and sort
  return Array.from(new Set(combined)).sort((a, b) => a.localeCompare(b));
};
