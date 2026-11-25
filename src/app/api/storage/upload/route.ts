import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { objectExists, objectKey, putObject } from "@/server/storage";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;

const fail = (message: string, status = 400) =>
  NextResponse.json({ error: { message } }, { status });

export async function POST(req: Request) {
  if (!(await getSessionUser())) return fail("Não autenticado", 401);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const bucket = String(form?.get("bucket") ?? "");
  const path = String(form?.get("path") ?? "");
  const upsert = form?.get("upsert") === "true";

  if (!(file instanceof Blob)) return fail("Arquivo ausente");
  if (file.size > MAX_BYTES) return fail("Arquivo maior que 15 MB");

  let key: string;
  try {
    key = objectKey(bucket, path);
  } catch (e) {
    return fail((e as Error).message);
  }

  if (!upsert && (await objectExists(key))) {
    return fail("The resource already exists", 409);
  }

  const contentType =
    String(form?.get("contentType") || "") || file.type || "application/octet-stream";

  try {
    await putObject(key, new Uint8Array(await file.arrayBuffer()), contentType);
  } catch (e) {
    console.error("[storage/upload]", e);
    return fail("Falha ao enviar arquivo para o armazenamento", 500);
  }

  return NextResponse.json({ data: { path } });
}
