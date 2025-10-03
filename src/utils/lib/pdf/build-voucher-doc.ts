import { VoucherPayload } from "@/types/Voucher.js";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces.js";
import { getBrandLogo } from "./logo";

const PAL = {
  blue: "#0C3B6B",
  gold: "#F2B705",
  white: "#FFFFFF",
  line: "#E6EDF5",
  text: "#0C3B6B",
};

const BRL = (n = 0) =>
  (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const D = (s?: string) =>
  s ? new Date(s).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";

const layoutBTJR = {
  paddingLeft: () => 12,
  paddingRight: () => 12,
  paddingTop: () => 7,
  paddingBottom: () => 7,
  hLineColor: () => PAL.line,
  vLineColor: () => PAL.line,
};

const sectionBar = (title: string) => ({
  table: {
    widths: ["*"],
    body: [
      [{ text: title, color: PAL.white, bold: true, alignment: "center" }],
    ],
  },
  layout: "noBorders",
  fillColor: PAL.gold,
  margin: [0, 12, 0, 0],
});

const whiteCard = (table: any) => ({
  ...table,
  layout: layoutBTJR,
  fillColor: PAL.white,
  margin: [0, 0, 0, 6],
});

export async function buildVoucherDoc(
  v: VoucherPayload,
  logo?: string
): Promise<TDocumentDefinitions> {
  const lg = logo ?? (await getBrandLogo());

  const styles = {
    hbrand: { fontSize: 12, bold: true, color: "#fff" },
    hsmall: { fontSize: 9, color: "#fff" },
    td: { fontSize: 10, color: PAL.text },
    tdC: { fontSize: 10, alignment: "center" as const, color: PAL.text },
    th: {
      bold: true,
      fillColor: "#F7FAFF",
      color: PAL.text,
      alignment: "center" as const,
    },
    footWhite: { fontSize: 9, color: "#FFF", alignment: "center" as const },
  };

  // background compatível com DynamicBackground
  const background = (
    _page: number,
    size: { width: number; height: number }
  ) => ({
    canvas: [
      {
        type: "rect" as const,
        x: 0,
        y: 0,
        w: size.width,
        h: size.height,
        color: PAL.blue,
      },
    ],
  });

  const MARGINS: [number, number, number, number] = [28, 24, 28, 28];

  const footer = (_currentPage: number, _pageCount: number): Content[] => [
    {
      text: "BeachTurJeri — sua aventura começa aqui",
      style: "footWhite",
      margin: [0, 10, 0, 10],
    },
  ];

  const doc: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: MARGINS,
    styles,
    background,
    footer,
    content: [
      {
        columns: [
          lg
            ? { image: lg, fit: [50, 50], alignment: "center" }
            : { width: 50, text: "" },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        stack: [
          {
            text: "BeachTurJeri - Pacotes Turísticos",
            style: "hbrand",
            alignment: "center",
          },
          {
            text: "Rua Osvaldo Cruz, 01 - Sala 405 - Ed. Beiramar Trade Center - Meireles",
            style: "hsmall",
            alignment: "center",
          },
          {
            text: "CNPJ - 47.404.049/0001-73 • www.beachturjeri.com.br • (85) 99270-9853",
            style: "hsmall",
            alignment: "center",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: `Código da Reserva: ${v.codigo}`,
            bold: true,
            color: PAL.white,
            margin: [0, 10, 0, 6],
          },
          {
            text: `Vendedor: ${v.vendedor}`,
            bold: true,
            color: PAL.white,
            alignment: "right" as const,
            margin: [0, 10, 0, 6],
          },
        ],
      },
      sectionBar("DADOS DO CLIENTE"),
      whiteCard({
        table: {
          widths: ["*", "*", 120],
          body: [
            [
              { text: "Contratante", style: "th" },
              { text: "Hotel/Embarque", style: "th" },
              { text: "Telefone", style: "th" },
            ],
            [
              { text: v.contratante ?? "-", style: "tdC" },
              { text: v.embarque || "-", style: "tdC" },
              { text: v.telefone || "-", style: "tdC" },
            ],
          ],
        },
      }),
      sectionBar("PASSEIOS / HOSPEDAGEM"),
      whiteCard({
        table: {
          widths: ["*", "25%", "18%"],
          body: [
            [
              { text: "Descrição", style: "th" },
              { text: "Data", style: "th" },
              { text: "Horário", style: "th" },
            ],
            ...(v.itens || []).map((i: any) => [
              { text: i.descricao, style: "tdC" },
              { text: D(i.data), style: "tdC" },
              { text: i.hora || "00:00", style: "tdC" },
            ]),
          ],
        },
      }),
      sectionBar("PASSAGEIROS"),
      whiteCard({
        table: {
          widths: ["*", "30%", "12%"],
          body: [
            [
              { text: "Nome", style: "th" },
              { text: "Telefone", style: "th" },
              { text: "Colo", style: "th" },
            ],
            ...(v.passageiros || []).map((p: any) => [
              { text: p.nome, style: "tdC" },
              { text: p.telefone || "-", style: "tdC" },
              { text: p.colo ? "SIM" : "NÃO", style: "tdC" },
            ]),
          ],
        },
      }),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: "RESUMO DE VALORES",
                color: PAL.white,
                bold: true,
                alignment: "center",
              },
            ],
          ],
        },
        layout: "noBorders",
        fillColor: PAL.gold,
        margin: [0, 8, 0, 0],
      },
      {
        table: {
          widths: ["*", "*", "*"],
          body: [
            [
              {
                text: `Valor Total: ${BRL(v.total)}`,
                alignment: "center" as const,
                bold: true,
                color: PAL.text,
              },
              {
                text: `Sinal/Entrada: ${BRL(v.entrada)}`,
                alignment: "center" as const,
                bold: true,
                color: PAL.text,
              },
              {
                text: `Valor Restante: ${BRL(v.restante)}`,
                alignment: "center" as const,
                bold: true,
                color: PAL.text,
              },
            ],
          ],
        },
        layout: layoutBTJR,
        fillColor: PAL.white,
        margin: [0, 0, 0, 8],
      },
      {
        text: "\nObservações / Regras",
        color: "#FFF",
        bold: true,
        alignment: "center" as const,
      },
      {
        text: v.observacoes || "Taxas e entradas de Jeri não inclusas...",
        color: "#FFF",
        fontSize: 9,
        alignment: "center" as const,
        margin: [20, 0, 20, 0],
      },
    ],
  };

  return doc;
}
