 
import type {
  DbResponse,
  Filter,
  FilterOp,
  QueryDescriptor,
} from "./types";

type SingleMode = "single" | "maybeSingle" | undefined;

async function postQuery(descriptor: QueryDescriptor): Promise<DbResponse<any>> {
  try {
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(descriptor),
    });
    const body = await res.json().catch(() => null);
    if (!body) {
      return {
        data: null,
        count: null,
        status: res.status,
        error: { message: `Erro ${res.status} ao consultar o servidor` },
      };
    }
    return { ...body, status: res.status };
  } catch (e) {
    return {
      data: null,
      count: null,
      status: 0,
      error: { message: e instanceof Error ? e.message : "Falha de rede" },
    };
  }
}

/**
 * Construtor de consultas com a mesma API encadeável do supabase-js
 * (subconjunto usado no projeto). É "thenable": basta dar await.
 */
export class QueryBuilder<Row = any, Result = Row[]>
  implements PromiseLike<DbResponse<Result>>
{
  private d: QueryDescriptor;
  private singleMode: SingleMode;

  constructor(table: string) {
    this.d = { table, action: "select", filters: [], order: [] };
  }

  /* ---------------- ações ---------------- */

  select(columns = "*", opts?: { count?: "exact"; head?: boolean }) {
    // Depois de insert/update/delete, .select() só define o retorno
    this.d.select = columns;
    if (opts?.count) this.d.count = opts.count;
    if (opts?.head) this.d.head = true;
    return this;
  }

  insert(values: Record<string, any> | Record<string, any>[], opts?: { count?: "exact" }) {
    this.d.action = "insert";
    this.d.values = values;
    this.d.select = null;
    if (opts?.count) this.d.count = opts.count;
    return this;
  }

  upsert(
    values: Record<string, any> | Record<string, any>[],
    opts?: { onConflict?: string; ignoreDuplicates?: boolean }
  ) {
    this.d.action = "upsert";
    this.d.values = values;
    this.d.select = null;
    this.d.onConflict = opts?.onConflict;
    this.d.ignoreDuplicates = opts?.ignoreDuplicates;
    return this;
  }

  update(values: Record<string, any>, opts?: { count?: "exact" }) {
    this.d.action = "update";
    this.d.values = values;
    this.d.select = null;
    if (opts?.count) this.d.count = opts.count;
    return this;
  }

  delete(opts?: { count?: "exact" }) {
    this.d.action = "delete";
    this.d.select = null;
    if (opts?.count) this.d.count = opts.count;
    return this;
  }

  /* ---------------- filtros ---------------- */

  private op(op: FilterOp, column: string, value: unknown) {
    this.d.filters!.push({ kind: "op", column, op, value } as Filter);
    return this;
  }

  eq(column: string, value: unknown) { return this.op("eq", column, value); }
  neq(column: string, value: unknown) { return this.op("neq", column, value); }
  gt(column: string, value: unknown) { return this.op("gt", column, value); }
  gte(column: string, value: unknown) { return this.op("gte", column, value); }
  lt(column: string, value: unknown) { return this.op("lt", column, value); }
  lte(column: string, value: unknown) { return this.op("lte", column, value); }
  like(column: string, pattern: string) { return this.op("like", column, pattern); }
  ilike(column: string, pattern: string) { return this.op("ilike", column, pattern); }
  is(column: string, value: null | boolean) { return this.op("is", column, String(value)); }
  in(column: string, values: readonly unknown[]) { return this.op("in", column, [...values]); }

  not(column: string, op: FilterOp, value: unknown) {
    this.d.filters!.push({ kind: "not", column, op, value });
    return this;
  }

  /** Mesma sintaxe do PostgREST: "col.eq.1,outra.ilike.%x%" */
  or(expr: string) {
    this.d.filters!.push({ kind: "or", expr });
    return this;
  }

  filter(column: string, op: FilterOp, value: unknown) {
    return this.op(op, column, value);
  }

  match(query: Record<string, unknown>) {
    Object.entries(query).forEach(([k, v]) => this.eq(k, v));
    return this;
  }

  /* ---------------- modificadores ---------------- */

  order(column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.d.order!.push({ column, ...opts });
    return this;
  }

  limit(n: number) {
    this.d.limit = n;
    return this;
  }

  range(from: number, to: number) {
    this.d.offset = from;
    this.d.limit = to - from + 1;
    return this;
  }

  single() {
    this.singleMode = "single";
    return this as unknown as QueryBuilder<Row, Row>;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this as unknown as QueryBuilder<Row, Row>;
  }

  /* ---------------- execução ---------------- */

  private async execute(): Promise<DbResponse<Result>> {
    const res = await postQuery(this.d);
    if (res.error || !this.singleMode) return res as DbResponse<Result>;

    const rows = Array.isArray(res.data) ? res.data : [];
    if (rows.length > 1 || (rows.length === 0 && this.singleMode === "single")) {
      return {
        data: null,
        count: res.count,
        status: 406,
        error: {
          code: "PGRST116",
          message: `Esperava 1 linha, retornou ${rows.length}`,
        },
      };
    }
    return { ...res, data: (rows[0] ?? null) as Result };
  }

  then<R1 = DbResponse<Result>, R2 = never>(
    onfulfilled?: ((value: DbResponse<Result>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null
  ): Promise<R1 | R2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
