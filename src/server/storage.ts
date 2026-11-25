import "server-only";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/** Cloudflare R2 é compatível com a API do S3. */
const globalForR2 = globalThis as unknown as { r2?: S3Client };

export const r2 =
  globalForR2.r2 ??
  new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
if (process.env.NODE_ENV !== "production") globalForR2.r2 = r2;

export const R2_BUCKET = () => {
  const b = process.env.R2_BUCKET;
  if (!b) throw new Error("R2_BUCKET não configurado");
  return b;
};

// Qualquer caractere imprimível, exceto barra invertida (barra "/" já separa as partes)
const SEGMENT = /^[^\\\x00-\x1f]+$/;

/** Monta a chave "bucket/caminho" validando cada parte (sem "..", sem "/" inicial). */
export function objectKey(bucket: string, path: string) {
  const parts = [bucket, ...path.split("/")];
  if (parts.some((p) => !p || p === "." || p === ".." || !SEGMENT.test(p))) {
    throw new Error("Caminho de arquivo inválido");
  }
  return parts.join("/");
}

export async function objectExists(key: string) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET(), Key: key }));
    return true;
  } catch {
    return false;
  }
}

export const putObject = (key: string, body: Uint8Array, contentType: string) =>
  r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

export const getObject = (key: string) =>
  r2.send(new GetObjectCommand({ Bucket: R2_BUCKET(), Key: key }));

export const deleteObjects = (keys: string[]) =>
  r2.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET(),
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    })
  );
