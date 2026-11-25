// Aplica os arquivos de db/migrations em ordem, uma única vez cada.
// Uso: npm run db:migrate
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch { /* usa variáveis do ambiente */ }

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não definido (.env.local).");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false },
});
await client.connect();

await client.query(`create table if not exists public.schema_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
)`);

const dir = path.resolve("db/migrations");
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
const { rows } = await client.query("select name from public.schema_migrations");
const done = new Set(rows.map((r) => r.name));

let applied = 0;
for (const file of files) {
  if (done.has(file)) continue;
  const sql = await readFile(path.join(dir, file), "utf8");
  process.stdout.write(`→ ${file} ... `);
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into public.schema_migrations (name) values ($1)", [file]);
    await client.query("commit");
    console.log("ok");
    applied++;
  } catch (e) {
    await client.query("rollback");
    console.log("ERRO");
    console.error(e.message);
    await client.end();
    process.exit(1);
  }
}

console.log(applied ? `${applied} migração(ões) aplicada(s).` : "Banco já está atualizado.");
await client.end();
