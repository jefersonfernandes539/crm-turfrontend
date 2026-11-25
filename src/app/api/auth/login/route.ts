import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/server/db";
import { createSession, type SessionUser } from "@/server/auth";

export const runtime = "nodejs";

const invalid = () =>
  NextResponse.json(
    { error: { message: "E-mail ou senha inválidos", code: "invalid_credentials" } },
    { status: 400 }
  );

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) return invalid();

  const { rows } = await pool.query<{
    id: string;
    email: string;
    name: string | null;
    password_hash: string;
  }>(
    `select id, email, name, password_hash
       from app_users
      where lower(email) = lower($1)
      limit 1`,
    [email.trim()]
  );

  const row = rows[0];
  // Compara mesmo sem usuário para não revelar quais e-mails existem pelo tempo de resposta
  const ok = await bcrypt.compare(
    password,
    row?.password_hash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva"
  );
  if (!row || !ok) return invalid();

  await pool.query(`update app_users set last_sign_in_at = now() where id = $1`, [row.id]);

  const user: SessionUser = {
    id: row.id,
    email: row.email,
    user_metadata: { name: row.name },
  };
  await createSession(user);
  return NextResponse.json({ user });
}
