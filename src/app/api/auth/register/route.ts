import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/server/db";
import { createSession, type SessionUser } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Cadastro aberto só se liberado explicitamente
  if (process.env.ALLOW_SIGNUP !== "true") {
    return NextResponse.json(
      { error: { message: "Cadastro desativado. Peça acesso ao administrador." } },
      { status: 403 }
    );
  }

  const { email, password, name } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: { message: "E-mail inválido" } }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: { message: "A senha precisa ter pelo menos 6 caracteres" } },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query<{ id: string; email: string; name: string | null }>(
      `insert into app_users (email, password_hash, name)
       values (lower($1), $2, $3)
       returning id, email, name`,
      [email.trim(), hash, name?.trim() || null]
    );
    const user: SessionUser = {
      id: rows[0].id,
      email: rows[0].email,
      user_metadata: { name: rows[0].name },
    };
    await createSession(user);
    return NextResponse.json({ user });
  } catch (e) {
    if ((e as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: { message: "Já existe uma conta com esse e-mail" } },
        { status: 400 }
      );
    }
    throw e;
  }
}
