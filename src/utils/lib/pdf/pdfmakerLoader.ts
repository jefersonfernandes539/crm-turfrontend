let cached: Promise<any> | null = null;

async function ensureScript(src: string): Promise<void> {
  await new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => res();
    s.onerror = () => rej(new Error("cdn err: " + src));
    document.head.appendChild(s);
  });
}

async function loadPdfMake(): Promise<any> {
  if ((window as any).pdfMake?.vfs) return (window as any).pdfMake;

  try {
    const pmModule = await import("pdfmake/build/pdfmake");
    const vfModule = await import("pdfmake/build/vfs_fonts");

    const pdfMake = (pmModule as any).pdfMake ?? pmModule;
    const vfs = (vfModule as any).pdfMake?.vfs ?? (vfModule as any).vfs;

    if (!vfs) throw new Error("vfs not found");

    pdfMake.vfs = vfs;
    (window as any).pdfMake = pdfMake;

    return pdfMake;
  } catch (e) {
    await ensureScript(
      "https://cdn.jsdelivr.net/npm/pdfmake@0.2.7/build/pdfmake.min.js"
    );
    await ensureScript(
      "https://cdn.jsdelivr.net/npm/pdfmake@0.2.7/build/vfs_fonts.js"
    );

    const pdfMake = (window as any).pdfMake;
    if (!pdfMake?.vfs) throw e;

    return pdfMake;
  }
}

export function getPdfMake(): Promise<any> {
  if (!cached) cached = loadPdfMake();
  return cached;
}
