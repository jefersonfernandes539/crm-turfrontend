// Copia todos os arquivos do Supabase Storage para o Cloudflare R2
// (chave no R2 = "<bucket>/<caminho>") e mostra o SQL para trocar as
// URLs antigas gravadas no banco.
//
// Uso (variáveis no .env.local ou no ambiente):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=...     (Project Settings → API → service_role)
//   R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET
//   npm run storage:migrate
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

try { process.loadEnvFile(".env.local"); } catch { /* usa variáveis do ambiente */ }

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  NEXT_PUBLIC_STORAGE_PUBLIC_URL,
} = process.env;

for (const [k, v] of Object.entries({
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: KEY, R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
})) {
  if (!v) { console.error(`Faltando ${k}`); process.exit(1); }
}

const base = SUPABASE_URL.replace(/\/+$/, "");
const headers = { Authorization: `Bearer ${KEY}`, apikey: KEY };

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function listAll(bucket, prefix = "") {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const res = await fetch(`${base}/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: "name", order: "asc" } }),
    });
    if (!res.ok) throw new Error(`list ${bucket}/${prefix}: ${res.status} ${await res.text()}`);
    const items = await res.json();
    for (const it of items) {
      const full = prefix ? `${prefix}/${it.name}` : it.name;
      if (it.id === null) out.push(...(await listAll(bucket, full))); // pasta
      else out.push(full);
    }
    if (items.length < 1000) break;
  }
  return out;
}

const exists = async (Key) => {
  try { await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key })); return true; }
  catch { return false; }
};

const bucketsRes = await fetch(`${base}/storage/v1/bucket`, { headers });
if (!bucketsRes.ok) {
  console.error("Não consegui listar buckets:", bucketsRes.status, await bucketsRes.text());
  process.exit(1);
}
const buckets = (await bucketsRes.json()).map((b) => b.name);
console.log("Buckets:", buckets.join(", ") || "(nenhum)");

let copied = 0, skipped = 0, failed = 0;
for (const bucket of buckets) {
  const files = await listAll(bucket);
  console.log(`\n[${bucket}] ${files.length} arquivo(s)`);
  for (const file of files) {
    const Key = `${bucket}/${file}`;
    if (await exists(Key)) { skipped++; continue; }
    const url = `${base}/storage/v1/object/${bucket}/${file.split("/").map(encodeURIComponent).join("/")}`;
    const res = await fetch(url, { headers });
    if (!res.ok) { console.error(`  ✗ ${Key} (${res.status})`); failed++; continue; }
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key,
      Body: new Uint8Array(await res.arrayBuffer()),
      ContentType: res.headers.get("content-type") ?? "application/octet-stream",
    }));
    copied++;
    console.log(`  ✓ ${Key}`);
  }
}

console.log(`\nCopiados: ${copied} · Já existiam: ${skipped} · Falhas: ${failed}`);

const oldPrefix = `${base}/storage/v1/object/public/`;
const newPrefix = `${(NEXT_PUBLIC_STORAGE_PUBLIC_URL || "https://SEU-DOMINIO/api/storage/file").replace(/\/+$/, "")}/`;
console.log(`
Agora rode no Neon para trocar as URLs antigas gravadas no banco:

do $$
declare r record;
begin
  for r in
    select table_name, column_name, data_type
      from information_schema.columns
     where table_schema = 'public'
       and data_type in ('text', 'character varying', 'jsonb', 'json')
  loop
    execute format(
      'update public.%I set %I = replace(%I::text, %L, %L)::%s where %I::text like %L',
      r.table_name, r.column_name, r.column_name,
      '${oldPrefix}', '${newPrefix}',
      case when r.data_type = 'character varying' then 'text' else r.data_type end,
      r.column_name, '%${oldPrefix}%'
    );
  end loop;
end $$;
`);
