import "server-only";
import { pool } from "./db";
import type {
  Filter,
  FilterOp,
  QueryDescriptor,
} from "@/services/db/types";

/* ==================================================================
 * Tradutor de consultas (subconjunto da API do PostgREST/Supabase)
 * para SQL parametrizado. Todas as respostas passam por json_agg,
 * então tipos chegam iguais ao Supabase: numeric -> number,
 * date -> "YYYY-MM-DD", timestamptz -> ISO.
 * ================================================================== */

export class QueryError extends Error {
  constructor(
    message: string,
    public code = "PGRST100",
    public status = 400,
    public details?: string
  ) {
    super(message);
  }
}

/** Tabelas que nunca podem ser acessadas pela API genérica. */
const BLOCKED_TABLES = new Set(["app_users"]);

/* ------------------------------------------------------------------ */
/* Metadados do schema (cache de 60s)                                  */
/* ------------------------------------------------------------------ */

type ForeignKey = { table: string; column: string; ref: string; refColumn: string };
type SchemaInfo = {
  columns: Map<string, Set<string>>;
  primaryKeys: Map<string, string[]>;
  foreignKeys: ForeignKey[];
};

let schemaCache: { at: number; info: SchemaInfo } | null = null;

async function getSchema(): Promise<SchemaInfo> {
  if (schemaCache && Date.now() - schemaCache.at < 60_000) return schemaCache.info;

  const [cols, pks, fks] = await Promise.all([
    pool.query<{ table_name: string; column_name: string }>(
      `select table_name, column_name
         from information_schema.columns
        where table_schema = 'public'`
    ),
    pool.query<{ table_name: string; column_name: string }>(
      `select tc.table_name, kcu.column_name
         from information_schema.table_constraints tc
         join information_schema.key_column_usage kcu
           on kcu.constraint_name = tc.constraint_name
          and kcu.table_schema = tc.table_schema
        where tc.table_schema = 'public' and tc.constraint_type = 'PRIMARY KEY'
        order by kcu.ordinal_position`
    ),
    pool.query<ForeignKey>(
      `select src.relname  as "table",
              a.attname    as "column",
              dst.relname  as "ref",
              af.attname   as "refColumn"
         from pg_constraint c
         join pg_class src on src.oid = c.conrelid
         join pg_class dst on dst.oid = c.confrelid
         join pg_attribute a  on a.attrelid  = c.conrelid  and a.attnum  = c.conkey[1]
         join pg_attribute af on af.attrelid = c.confrelid and af.attnum = c.confkey[1]
        where c.contype = 'f'
          and c.connamespace = 'public'::regnamespace
          and array_length(c.conkey, 1) = 1`
    ),
  ]);

  const info: SchemaInfo = {
    columns: new Map(),
    primaryKeys: new Map(),
    foreignKeys: fks.rows,
  };
  for (const r of cols.rows) {
    if (!info.columns.has(r.table_name)) info.columns.set(r.table_name, new Set());
    info.columns.get(r.table_name)!.add(r.column_name);
  }
  for (const r of pks.rows) {
    if (!info.primaryKeys.has(r.table_name)) info.primaryKeys.set(r.table_name, []);
    info.primaryKeys.get(r.table_name)!.push(r.column_name);
  }

  schemaCache = { at: Date.now(), info };
  return info;
}

/* ------------------------------------------------------------------ */
/* Identificadores e parâmetros                                        */
/* ------------------------------------------------------------------ */

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

const q = (name: string) => {
  if (!IDENT.test(name)) throw new QueryError(`Identificador inválido: ${name}`);
  return `"${name}"`;
};

class Params {
  values: unknown[] = [];
  add(v: unknown) {
    this.values.push(v);
    return `$${this.values.length}`;
  }
}

function assertTable(schema: SchemaInfo, table: string) {
  if (BLOCKED_TABLES.has(table) || !schema.columns.has(table)) {
    throw new QueryError(
      `Tabela "${table}" não encontrada`,
      "42P01",
      404
    );
  }
}

function assertColumn(schema: SchemaInfo, table: string, column: string) {
  if (!schema.columns.get(table)?.has(column)) {
    throw new QueryError(
      `Coluna "${column}" não existe em "${table}"`,
      "42703"
    );
  }
}

/* ------------------------------------------------------------------ */
/* Parser do select: "*, operators(name), itens:reservation_items(*)"  */
/* ------------------------------------------------------------------ */

type SelectItem =
  | { type: "star" }
  | { type: "column"; name: string; alias?: string }
  | { type: "embed"; rel: string; alias?: string; hint?: string; items: SelectItem[] };

function splitTopLevel(input: string, sep = ","): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quoted = false;
  let cur = "";
  for (const ch of input) {
    if (ch === '"') quoted = !quoted;
    if (!quoted) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === sep && depth === 0) {
        parts.push(cur);
        cur = "";
        continue;
      }
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseSelect(select: string): SelectItem[] {
  const clean = select.replace(/\s+/g, "");
  if (!clean) return [{ type: "star" }];

  return splitTopLevel(clean).map<SelectItem>((part) => {
    const open = part.indexOf("(");
    if (open > 0 && part.endsWith(")")) {
      let head = part.slice(0, open);
      const inner = part.slice(open + 1, -1);
      let alias: string | undefined;
      if (head.includes(":")) [alias, head] = head.split(":");
      // remove modificador !inner/!left e captura dica de FK
      const [rel, ...mods] = head.split("!");
      const hint = mods.find((m) => m !== "inner" && m !== "left");
      return { type: "embed", rel, alias, hint, items: parseSelect(inner) };
    }
    if (part === "*") return { type: "star" };
    let name = part.split("::")[0];
    let alias: string | undefined;
    if (name.includes(":")) [alias, name] = name.split(":");
    return { type: "column", name, alias };
  });
}

let aliasSeq = 0;

function buildSelectList(
  schema: SchemaInfo,
  table: string,
  alias: string,
  items: SelectItem[]
): string {
  return items
    .map((item) => {
      if (item.type === "star") return `${q(alias)}.*`;

      if (item.type === "column") {
        assertColumn(schema, table, item.name);
        return `${q(alias)}.${q(item.name)}${item.alias ? ` as ${q(item.alias)}` : ""}`;
      }

      // embed
      assertTable(schema, item.rel);
      const outName = q(item.alias ?? item.rel);
      const subAlias = `_t${++aliasSeq}`;
      const subList = buildSelectList(schema, item.rel, subAlias, item.items);
      const matchHint = (fk: ForeignKey) =>
        !item.hint || fk.column === item.hint || fk.refColumn === item.hint;

      // muitos-para-um: tabela atual aponta para rel
      const m2o = schema.foreignKeys.find(
        (fk) => fk.table === table && fk.ref === item.rel && matchHint(fk)
      );
      if (m2o) {
        return `(select row_to_json(_e) from (select ${subList} from ${q(item.rel)} as ${q(subAlias)}
                  where ${q(subAlias)}.${q(m2o.refColumn)} = ${q(alias)}.${q(m2o.column)} limit 1) _e) as ${outName}`;
      }

      // um-para-muitos: rel aponta para a tabela atual
      const o2m = schema.foreignKeys.find(
        (fk) => fk.table === item.rel && fk.ref === table && matchHint(fk)
      );
      if (o2m) {
        return `coalesce((select json_agg(_e) from (select ${subList} from ${q(item.rel)} as ${q(subAlias)}
                  where ${q(subAlias)}.${q(o2m.column)} = ${q(alias)}.${q(o2m.refColumn)}) _e), '[]'::json) as ${outName}`;
      }

      throw new QueryError(
        `Nenhum relacionamento entre "${table}" e "${item.rel}"`,
        "PGRST200"
      );
    })
    .join(", ");
}

/* ------------------------------------------------------------------ */
/* Filtros                                                             */
/* ------------------------------------------------------------------ */

const COMPARATORS: Partial<Record<FilterOp, string>> = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
};

function opSql(
  schema: SchemaInfo,
  table: string,
  alias: string,
  column: string,
  op: FilterOp,
  value: unknown,
  params: Params,
  negate = false
): string {
  assertColumn(schema, table, column);
  const col = `${q(alias)}.${q(column)}`;
  let sql: string;

  if ((op === "eq" || op === "neq") && value === null) {
    sql = `${col} is ${op === "eq" ? "" : "not "}null`;
  } else if (COMPARATORS[op]) {
    sql = `${col} ${COMPARATORS[op]} ${params.add(value)}`;
  } else if (op === "like" || op === "ilike") {
    const pattern = String(value).replace(/\*/g, "%");
    sql = `${col}::text ${op} ${params.add(pattern)}`;
  } else if (op === "is") {
    const v = String(value).toLowerCase();
    if (!["null", "true", "false", "unknown"].includes(v)) {
      throw new QueryError(`Valor inválido para is: ${value}`);
    }
    sql = `${col} is ${v}`;
  } else if (op === "in") {
    const list = Array.isArray(value) ? value : [];
    sql = list.length ? `${col} = any(${params.add(list)})` : "false";
  } else {
    throw new QueryError(`Operador não suportado: ${op}`);
  }

  return negate ? `not (${sql})` : sql;
}

/** Converte a sintaxe do .or(): "a.eq.1,b.ilike.%x%,c.in.(1,2)" */
function orSql(
  schema: SchemaInfo,
  table: string,
  alias: string,
  expr: string,
  params: Params
): string {
  const parts = splitTopLevel(expr).map((cond) => {
    if (cond.startsWith("and(") && cond.endsWith(")")) {
      const inner = splitTopLevel(cond.slice(4, -1));
      return `(${inner.map((c) => condSql(c)).join(" and ")})`;
    }
    return condSql(cond);
  });
  return `(${parts.join(" or ")})`;

  function condSql(cond: string) {
    const [column, ...rest] = cond.split(".");
    let negate = false;
    if (rest[0] === "not") {
      negate = true;
      rest.shift();
    }
    const op = rest.shift() as FilterOp;
    let raw: string = rest.join(".");
    let value: unknown = raw;
    if (op === "in") {
      raw = raw.replace(/^\(|\)$/g, "");
      value = splitTopLevel(raw).map((v) => v.replace(/^"|"$/g, ""));
    } else if (raw.startsWith('"') && raw.endsWith('"')) {
      value = raw.slice(1, -1);
    }
    return opSql(schema, table, alias, column, op, value, params, negate);
  }
}

function whereSql(
  schema: SchemaInfo,
  table: string,
  alias: string,
  filters: Filter[],
  params: Params
) {
  const conds = filters.map((f) =>
    f.kind === "or"
      ? orSql(schema, table, alias, f.expr, params)
      : opSql(schema, table, alias, f.column, f.op, f.value, params, f.kind === "not")
  );
  return conds.length ? ` where ${conds.join(" and ")}` : "";
}

/* ------------------------------------------------------------------ */
/* Execução                                                            */
/* ------------------------------------------------------------------ */

export type QueryResult = { data: unknown; count: number | null };

export async function runQuery(d: QueryDescriptor): Promise<QueryResult> {
  const schema = await getSchema();
  assertTable(schema, d.table);

  const T = q(d.table);
  const A = "_t0";
  const params = new Params();
  const where = () => whereSql(schema, d.table, A, d.filters ?? [], params);

  const returning = d.select === null || d.select === undefined
    ? d.action === "select" ? "*" : null
    : d.select || "*";
  const list = returning
    ? buildSelectList(schema, d.table, A, parseSelect(returning))
    : null;

  let count: number | null = null;

  /* -------- SELECT -------- */
  if (d.action === "select") {
    const whereClause = where();

    if (d.count === "exact") {
      const countParams = [...params.values];
      const { rows } = await pool.query<{ c: number }>(
        `select count(*)::int as c from ${T} as ${q(A)}${whereClause}`,
        countParams
      );
      count = rows[0]?.c ?? 0;
      if (d.head) return { data: null, count };
    }

    const order = (d.order ?? [])
      .map((o) => {
        assertColumn(schema, d.table, o.column);
        const nulls =
          o.nullsFirst === undefined ? "" : o.nullsFirst ? " nulls first" : " nulls last";
        return `${q(A)}.${q(o.column)} ${o.ascending === false ? "desc" : "asc"}${nulls}`;
      })
      .join(", ");

    const limit = d.limit !== undefined ? ` limit ${Math.max(0, Math.floor(d.limit))}` : "";
    const offset = d.offset ? ` offset ${Math.max(0, Math.floor(d.offset))}` : "";

    const sql = `select coalesce(json_agg(_r), '[]'::json) as data from (
      select ${list} from ${T} as ${q(A)}${whereClause}${order ? ` order by ${order}` : ""}${limit}${offset}
    ) _r`;
    const { rows } = await pool.query(sql, params.values);
    return { data: rows[0].data, count };
  }

  /* -------- INSERT / UPSERT / UPDATE / DELETE -------- */
  // Insert em lote pode ter linhas com colunas diferentes: cada grupo vira
  // um INSERT próprio, para que colunas ausentes usem o DEFAULT do banco.
  const mutations: string[] = [];

  if (d.action === "insert" || d.action === "upsert") {
    const rows = (Array.isArray(d.values) ? d.values : [d.values]).filter(Boolean) as Record<string, unknown>[];
    if (!rows.length) throw new QueryError("Nada para inserir");

    const groups = new Map<string, { keys: string[]; rows: Record<string, unknown>[] }>();
    for (const row of rows) {
      const keys = Object.keys(row).sort();
      const sig = keys.join(",");
      if (!groups.has(sig)) groups.set(sig, { keys, rows: [] });
      groups.get(sig)!.rows.push(row);
    }

    for (const { keys, rows: groupRows } of groups.values()) {
      keys.forEach((k) => assertColumn(schema, d.table, k));
      const cols = keys.map(q).join(", ");

      if (!keys.length) {
        // Linhas vazias: uma por linha, todas com defaults
        groupRows.forEach(() =>
          mutations.push(`insert into ${T} default values returning *`)
        );
        continue;
      }

      let m = `insert into ${T} (${cols})
        select ${cols} from json_populate_recordset(null::${T}, ${params.add(JSON.stringify(groupRows))}::json)`;

      if (d.action === "upsert") {
        const target = d.onConflict
          ? d.onConflict.split(",").map((c) => c.trim())
          : schema.primaryKeys.get(d.table) ?? [];
        target.forEach((c) => assertColumn(schema, d.table, c));
        if (!target.length) throw new QueryError("Upsert sem chave de conflito");
        const updatable = keys.filter((k) => !target.includes(k));
        m +=
          d.ignoreDuplicates || !updatable.length
            ? ` on conflict (${target.map(q).join(", ")}) do nothing`
            : ` on conflict (${target.map(q).join(", ")}) do update set ${updatable
                .map((k) => `${q(k)} = excluded.${q(k)}`)
                .join(", ")}`;
      }
      mutations.push(`${m} returning *`);
    }
  } else if (d.action === "update") {
    if (!d.filters?.length) throw new QueryError("UPDATE exige pelo menos um filtro");
    const values = (d.values ?? {}) as Record<string, unknown>;
    const keys = Object.keys(values);
    if (!keys.length) throw new QueryError("Nada para atualizar");
    keys.forEach((k) => assertColumn(schema, d.table, k));
    const valuesParam = params.add(JSON.stringify(values));
    mutations.push(`update ${T} as ${q(A)} set ${keys
      .map((k) => `${q(k)} = _v.${q(k)}`)
      .join(", ")}
      from json_populate_record(null::${T}, ${valuesParam}::json) as _v${where()}
      returning ${q(A)}.*`);
  } else if (d.action === "delete") {
    if (!d.filters?.length) throw new QueryError("DELETE exige pelo menos um filtro");
    mutations.push(`delete from ${T} as ${q(A)}${where()} returning ${q(A)}.*`);
  } else {
    throw new QueryError(`Ação inválida: ${String(d.action)}`);
  }

  const ctes = mutations.map((m, i) => `_m${i} as (${m})`).join(",\n");
  const union = mutations.map((_, i) => `select * from _m${i}`).join(" union all ");

  const sql = `with ${ctes}, _w as (${union})
    select coalesce(json_agg(_r), '[]'::json) as data, count(*)::int as c
      from (select ${list ?? `${q(A)}.*`} from _w as ${q(A)}) _r`;

  const { rows } = await pool.query(sql, params.values);
  return {
    data: returning ? rows[0].data : null,
    count: d.count === "exact" ? rows[0].c : null,
  };
}
