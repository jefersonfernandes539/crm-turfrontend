// src/lib/pdf/gerarVoucherPDF.ts
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { getPdfMake } from "./pdfmakerLoader";
import { buildVoucherDoc } from "./build-voucher-doc";
import { VoucherPayload } from "@/types/Voucher";

// Função para normalizar o nome do arquivo
const nomeArquivo = (codigo?: string, cliente?: string): string => {
  const norm = (s?: string) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, " ");

  return `${norm(codigo || `BTJR${Date.now()}`)} - ${norm(
    cliente || "Voucher"
  )}.pdf`;
};

// Função principal para gerar e baixar o PDF
export async function gerarVoucherPDF(payload: VoucherPayload): Promise<void> {
  const pdfMake = await getPdfMake(); // retorna o objeto pdfMake carregado
  const doc: TDocumentDefinitions = await buildVoucherDoc(payload); 

  const filename = nomeArquivo(payload.codigo, payload.contratante);

  pdfMake.createPdf(doc).getBlob(async (blob: Blob) => {
    const file = new File([blob], filename, { type: "application/pdf" });

    // Suporte a Web Share API
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return;
      } catch (err) {
        console.warn("Falha ao usar navigator.share:", err);
      }
    }

    // Fallback para download via link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  });
}
