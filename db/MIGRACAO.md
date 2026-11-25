# Migração Supabase → Neon + Cloudflare R2

O app não usa mais o Supabase. O navegador fala só com rotas próprias:

| Antes (Supabase)     | Agora                                             |
| -------------------- | ------------------------------------------------- |
| Banco (PostgREST)    | `/api/db` → Postgres no **Neon**                  |
| Supabase Auth        | `/api/auth/*` → tabela `app_users` + cookie JWT   |
| Storage              | `/api/storage/*` → **Cloudflare R2**              |
| Realtime             | polling a cada 15 s enquanto a aba está aberta    |

As telas continuam usando a mesma API (`db.from(...).select().eq()...`),
implementada em `src/services/db`.

## Projeto novo (sem dados antigos)

1. Crie o banco no Neon e o bucket no R2; preencha `.env.local` a partir de `.env.example`.
2. Crie as tabelas do CRM (o schema antigo vivia só no Supabase; restaure-o pelo passo a passo abaixo).
3. `npm run db:migrate`
4. `npm run user:create -- voce@email.com "senha" "Seu Nome"`
5. `npm run dev`

## Trazendo os dados do Supabase

Precisa do `pg_dump`/`psql` na mesma versão (ou maior) do Postgres do Supabase.

1. **No Supabase (SQL Editor):** rode `db/supabase-export/01_preparar_no_supabase.sql`.
   Copia os usuários (com o hash da senha — todos mantêm a mesma senha) para `public.app_users`
   e aponta as FKs de `auth.users` para essa tabela. Faça isso na hora da virada.
2. **Dump** (connection string em Supabase → Project Settings → Database):
   ```
   pg_dump "SUPABASE_DB_URL" --schema=public --no-owner --no-privileges -f dump.sql
   ```
3. **No Neon:** rode `db/supabase-export/02_preparar_no_neon.sql`, depois restaure:
   ```
   psql "DATABASE_URL" -f dump.sql
   ```
   Erros em `CREATE POLICY` podem ser ignorados — o app não usa RLS.
4. `npm run db:migrate` (aplica o que faltar, ex.: hospedagem).
5. **Arquivos:** defina `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` e rode
   `npm run storage:migrate`. Ele copia tudo para o R2 e imprime o SQL que troca as URLs
   antigas (`...supabase.co/storage/...`) gravadas no banco — rode esse SQL no Neon.
6. Teste o login e as telas; depois pode desligar o projeto no Supabase.

## Observações

- Cadastro aberto fica desligado (`ALLOW_SIGNUP=false`); crie usuários com `npm run user:create`.
- Qualquer usuário logado acessa todas as tabelas (igual às políticas atuais), exceto `app_users`,
  que a API bloqueia. UPDATE/DELETE sem filtro são recusados.
- Painéis de vendas atualizam a cada 15 s (antes era instantâneo via Realtime).
