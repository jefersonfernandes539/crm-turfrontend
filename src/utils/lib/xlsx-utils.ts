import * as XLSX from "xlsx";

export const inPer = (dateStr: string, month: number, year: number) => {
  const date = new Date(dateStr);
  return date.getMonth() === month && date.getFullYear() === year;
};

export const rank = (arr: { vendedor: string; comissao: number }[]) => {
  const map: Record<string, number> = {};
  arr.forEach(({ vendedor, comissao }) => {
    map[vendedor] = (map[vendedor] || 0) + comissao;
  });
  return Object.entries(map).map(([vendedor, total]) => ({ vendedor, total }));
};

export const parse = (
  ws: XLSX.WorkSheet,
  month: number,
  year: number,
  extraSellers: string[]
) => {
  const json = XLSX.utils.sheet_to_json(ws);
  return json.map((row: any, index: number) => ({
    id: row.id || index,
    client_name: row.cliente,
    seller_id: row.vendedor,
    pix_value: Number(row.pix) || 0,
    commission: Number(row.comissao) || 0,
    date: row.data,
  }));
};
