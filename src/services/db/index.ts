import { QueryBuilder } from "./query-builder";
import { auth } from "./auth";
import { storage } from "./storage";
import { PollingChannel } from "./realtime";

/**
 * Cliente de dados do app (navegador).
 *  - db.from("tabela")...  -> /api/db      -> Postgres (Neon)
 *  - db.auth.*             -> /api/auth/*  -> tabela app_users + cookie JWT
 *  - db.storage.from(b)... -> /api/storage -> Cloudflare R2
 *  - db.channel(...)       -> polling (substitui o realtime)
 */
export const db = {
   
  from: <Row = any>(table: string) => new QueryBuilder<Row>(table),
  auth,
  storage,
  channel: (name: string) => new PollingChannel(name),
  removeChannel: (channel: PollingChannel) => channel.unsubscribe(),
};

export type { AuthUser, AuthSession } from "./types";
