export function formatCurrency(
  value: number | string | null | undefined,
  options: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (value === null || value === undefined || value === "") {
    return "R$ 0,00";
  }

  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return "R$ 0,00";
  }

  const {
    locale = "pt-BR",
    currency = "BRL",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(numericValue);
  } catch (error) {
    console.warn("Erro ao formatar moeda:", error);
    return `R$ ${numericValue.toFixed(2).replace(".", ",")}`;
  }
}

/**
 * Formata um número como porcentagem
 * @param value - Valor numérico (ex: 0.15 para 15%)
 * @param decimals - Número de casas decimais (padrão: 1)
 * @returns String formatada como porcentagem (ex: "15,0%")
 */
export function formatPercentage(
  value: number | string | null | undefined,
  decimals = 1
): string {
  if (value === null || value === undefined || value === "") {
    return "0,0%";
  }

  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return "0,0%";
  }

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numericValue);
  } catch (error) {
    console.warn("Erro ao formatar porcentagem:", error);
    return `${(numericValue * 100).toFixed(decimals).replace(".", ",")}%`;
  }
}

/**
 * Formata um número simples com separadores de milhares
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais (padrão: 0)
 * @returns String formatada (ex: "1.234" ou "1.234,56")
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals = 0
): string {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return "0";
  }

  try {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numericValue);
  } catch (error) {
    console.warn("Erro ao formatar número:", error);
    return numericValue.toFixed(decimals).replace(".", ",");
  }
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return "-";

  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
