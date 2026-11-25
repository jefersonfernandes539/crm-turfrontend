// Cria (ou redefine a senha de) um usuário do CRM.
// Uso: npm run user:create -- email@exemplo.com "senha" "Nome Opcional"
import bcrypt from "bcryptjs";
import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch { /* usa variáveis do ambiente */ }

const [email, password, name] = process.argv.slice(2);
if (!email || !password) {
  console.error('Uso: npm run user:create -- email@exemplo.com "senha" "Nome"');
  process.exit(1);
}
if (password.length < 6) {
  console.error("A senha precisa ter pelo menos 6 caracteres.");
  process.exit(1);
}

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

const hash = await bcrypt.hash(password, 10);
const existing = await client.query(
  "select id from public.app_users where lower(email) = lower($1)",
  [email]
);

if (existing.rows[0]) {
  await client.query(
    "update public.app_users set password_hash = $2, name = coalesce($3, name) where id = $1",
    [existing.rows[0].id, hash, name || null]
  );
  console.log(`Senha de ${email} atualizada.`);
} else {
  await client.query(
    "insert into public.app_users (email, password_hash, name) values (lower($1), $2, $3)",
    [email, hash, name || null]
  );
  console.log(`Usuário ${email} criado.`);
}

await client.end();
