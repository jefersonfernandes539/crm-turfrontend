-- =====================================================================
-- PASSO 2 — Rodar no NEON (banco novo, vazio) ANTES de restaurar o dump.
-- Cria o que o dump do Supabase costuma referenciar (roles, schema
-- "extensions", auth.uid()) para a restauração não quebrar.
-- Nada disso é usado pelo app novo.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end $$;

create schema if not exists extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists auth;
create or replace function auth.uid() returns uuid
  language sql stable as $$ select null::uuid $$;
create or replace function auth.role() returns text
  language sql stable as $$ select null::text $$;
create or replace function auth.jwt() returns jsonb
  language sql stable as $$ select '{}'::jsonb $$;
