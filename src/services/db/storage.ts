import type { DbError } from "./types";

/**
 * Arquivos no Cloudflare R2. Cada "bucket" vira um prefixo dentro de um
 * único bucket R2: vouchers/partners/foto.png
 */
const publicBase = () => {
  const configured = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  // Sem domínio público configurado, os arquivos são servidos pela própria app
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/api/storage/file`;
};

const encodePath = (p: string) =>
  p.split("/").map(encodeURIComponent).join("/");

function bucket(name: string) {
  return {
    async upload(
      path: string,
      file: Blob,
      opts?: { upsert?: boolean; contentType?: string }
    ): Promise<{ data: { path: string } | null; error: DbError | null }> {
      const form = new FormData();
      form.append("bucket", name);
      form.append("path", path);
      form.append("upsert", String(!!opts?.upsert));
      if (opts?.contentType) form.append("contentType", opts.contentType);
      form.append("file", file);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { data: null, error: body.error ?? { message: "Falha no upload" } };
      }
      return { data: { path }, error: null };
    },

    getPublicUrl(path: string) {
      return { data: { publicUrl: `${publicBase()}/${name}/${encodePath(path)}` } };
    },

    async download(path: string): Promise<{ data: Blob | null; error: DbError | null }> {
      const res = await fetch(`/api/storage/file/${name}/${encodePath(path)}`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        return { data: null, error: { message: `Arquivo não encontrado (${res.status})` } };
      }
      return { data: await res.blob(), error: null };
    },

    async remove(paths: string[]): Promise<{ data: null; error: DbError | null }> {
      const res = await fetch("/api/storage/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ bucket: name, paths }),
      });
      const body = await res.json().catch(() => ({}));
      return { data: null, error: res.ok ? null : body.error ?? { message: "Falha ao remover" } };
    },
  };
}

export const storage = { from: bucket };
