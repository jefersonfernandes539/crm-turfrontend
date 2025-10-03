import { VoucherPayload } from "@/types/Voucher";
import { buildVoucherDoc } from "./build-voucher-doc";
import { getPdfMake } from "./pdfmakerLoader";

const nomeArquivo = (codigo?: string, cliente?: string) => {
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

export async function gerarVoucherPDF(payload: VoucherPayload) {
  const pdfMake = await getPdfMake();
  const doc = await buildVoucherDoc(payload);
  const filename = nomeArquivo(payload?.codigo, payload?.contratante);

  pdfMake.createPdf(doc).getBlob(async (blob: Blob) => {
    const file = new File([blob], filename, { type: "application/pdf" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return;
      } catch {}
    }

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
