import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { QueryError, runQuery } from "@/server/query";
import type { QueryDescriptor } from "@/services/db/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { data: null, count: null, error: { message: "Não autenticado", code: "401" } },
      { status: 401 }
    );
  }

  let descriptor: QueryDescriptor;
  try {
    descriptor = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, count: null, error: { message: "JSON inválido" } },
      { status: 400 }
    );
  }

  try {
    const { data, count } = await runQuery(descriptor);
    return NextResponse.json({ data, count, error: null });
  } catch (e: unknown) {
    if (e instanceof QueryError) {
      return NextResponse.json(
        { data: null, count: null, error: { message: e.message, code: e.code, details: e.details ?? null } },
        { status: e.status }
      );
    }
    // Erros do Postgres: repassa mensagem e código (ex.: 23503 FK, P0001 trigger)
    const pg = e as { message?: string; code?: string; detail?: string; hint?: string };
    if (pg?.code) {
      return NextResponse.json(
        {
          data: null,
          count: null,
          error: { message: pg.message, code: pg.code, details: pg.detail ?? null, hint: pg.hint ?? null },
        },
        { status: 400 }
      );
    }
    console.error("[api/db]", e);
    return NextResponse.json(
      { data: null, count: null, error: { message: "Erro interno ao consultar o banco" } },
      { status: 500 }
    );
  }
}
