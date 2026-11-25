/** Tipos compartilhados entre o cliente (navegador) e a API /api/db. */

export type FilterOp =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "is"
  | "in";

export type Filter =
  | { kind: "op" | "not"; column: string; op: FilterOp; value: unknown }
  | { kind: "or"; expr: string };

export type QueryAction = "select" | "insert" | "update" | "upsert" | "delete";

export type QueryDescriptor = {
  table: string;
  action: QueryAction;
  /** Colunas retornadas. `null` = mutação sem retorno (sem .select()). */
  select?: string | null;
  filters?: Filter[];
  order?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
  limit?: number;
  offset?: number;
  count?: "exact";
  head?: boolean;
  values?: Record<string, unknown> | Record<string, unknown>[];
  onConflict?: string;
  ignoreDuplicates?: boolean;
};

export type DbError = {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
};

/** Como no supabase-js: sem erro, `data` não é nulo. */
export type DbResponse<T> =
  | { data: T; error: null; count: number | null; status: number }
  | { data: null; error: DbError; count: number | null; status: number };

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: { name?: string | null; full_name?: string | null };
};

export type AuthSession = { user: AuthUser };
