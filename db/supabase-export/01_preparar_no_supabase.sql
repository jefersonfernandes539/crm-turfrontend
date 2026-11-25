-- =====================================================================
-- PASSO 1 — Rodar no SQL Editor do SUPABASE (projeto antigo), na virada.
-- Copia os usuários do Supabase Auth para public.app_users (com o hash
-- bcrypt da senha) e aponta as FKs que iam para auth.users para ela.
-- Depois disso, o pg_dump do schema public leva tudo junto.
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

insert into public.app_users (id, email, password_hash, name, created_at, last_sign_in_at)
select u.id,
       lower(u.email),
       u.encrypted_password,
       coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name'),
       u.created_at,
       u.last_sign_in_at
  from auth.users u
 where u.email is not null
   and u.encrypted_password is not null
on conflict (id) do update
   set email = excluded.email,
       password_hash = excluded.password_hash,
       name = excluded.name,
       last_sign_in_at = excluded.last_sign_in_at;

-- FKs public.* -> auth.users passam a apontar para public.app_users
do $$
declare r record;
begin
  for r in
    select c.conname, c.conrelid::regclass as tbl, a.attname as col,
           c.confdeltype
      from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
     where c.contype = 'f'
       and c.confrelid = 'auth.users'::regclass
       and c.connamespace = 'public'::regnamespace
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
    execute format(
      'alter table %s add constraint %I foreign key (%I) references public.app_users(id) %s',
      r.tbl, r.conname, r.col,
      case r.confdeltype when 'c' then 'on delete cascade'
                         when 'n' then 'on delete set null'
                         else '' end
    );
    raise notice 'FK % de % agora aponta para app_users', r.conname, r.tbl;
  end loop;
end $$;

select count(*) as usuarios_copiados from public.app_users;
