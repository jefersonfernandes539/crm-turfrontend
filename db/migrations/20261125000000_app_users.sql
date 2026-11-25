-- =====================================================================
-- Usuários do CRM (substitui o Supabase Auth)
-- Senhas em bcrypt — os hashes exportados do Supabase são compatíveis,
-- então quem já tinha conta continua com a mesma senha.
-- Esta tabela é bloqueada na API genérica /api/db.
-- =====================================================================

create table if not exists public.app_users (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  password_hash    text not null,
  name             text,
  created_at       timestamptz not null default now(),
  last_sign_in_at  timestamptz
);

create unique index if not exists app_users_email_key
  on public.app_users (lower(email));
