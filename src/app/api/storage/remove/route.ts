import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { deleteObjects, objectKey } from "@/server/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: { message: "Não autenticado" } }, { status: 401 });
  }
  const { bucket, paths } = (await req.json().catch(() => ({}))) as {
    bucket?: string;
    paths?: string[];
  };
  if (!bucket || !Array.isArray(paths) || !paths.length) {
    return NextResponse.json({ error: { message: "Nada para remover" } }, { status: 400 });
  }
  try {
    await deleteObjects(paths.map((p) => objectKey(bucket, p)));
    return NextResponse.json({ data: null });
  } catch (e) {
    return NextResponse.json({ error: { message: (e as Error).message } }, { status: 400 });
  }
}
