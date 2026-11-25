import "server-only";
import { Pool } from "pg";

/**
 * Pool de conexões com o Postgres (Neon).
 * Use a connection string *pooled* do Neon (host com "-pooler") em produção.
 */
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    ssl: process.env.DATABASE_URL?.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;
