import { getObject, objectKey } from "@/server/storage";

export const runtime = "nodejs";

/**
 * Leitura pública de arquivos (equivale ao bucket público do Supabase).
 * Usado quando NEXT_PUBLIC_STORAGE_PUBLIC_URL não está configurado.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const [bucket, ...rest] = key.map(decodeURIComponent);

  let objKey: string;
  try {
    objKey = objectKey(bucket, rest.join("/"));
  } catch {
    return new Response("Caminho inválido", { status: 400 });
  }

  try {
    const obj = await getObject(objKey);
    const body = obj.Body?.transformToWebStream();
    if (!body) return new Response("Não encontrado", { status: 404 });
    return new Response(body, {
      headers: {
        "Content-Type": obj.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
        ...(obj.ContentLength ? { "Content-Length": String(obj.ContentLength) } : {}),
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
