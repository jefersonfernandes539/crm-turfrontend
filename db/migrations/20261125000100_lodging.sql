-- =====================================================================
-- Módulo de Hospedagem (hostel, camping, pousada, chalés, glamping)
-- =====================================================================
-- lodging_units : cada acomodação vendável (quarto, dormitório, área de
--                 camping, vaga de motorhome, chalé...)
-- lodging_stays : cada estadia (check-in / check-out) em uma acomodação
--
-- booking_mode:
--   exclusive -> a unidade inteira é de um único grupo por vez
--                (quarto privativo, chalé, lote de camping)
--   shared    -> várias estadias convivem até somar `capacity` pessoas
--                (dormitório de hostel vendido por cama, área de camping
--                coletiva vendida por pessoa)
-- =====================================================================

create table if not exists public.lodging_units (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null default 'private_room'
                check (type in (
                  'private_room', 'dorm', 'camping_tent', 'camping_rv',
                  'cabin', 'glamping', 'other'
                )),
  booking_mode  text not null default 'exclusive'
                check (booking_mode in ('exclusive', 'shared')),
  capacity      integer not null default 1 check (capacity > 0),
  price_mode    text not null default 'per_unit'
                check (price_mode in ('per_unit', 'per_person')),
  nightly_rate  numeric(10, 2) not null default 0 check (nightly_rate >= 0),
  description   text,
  active        boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.lodging_stays (
  id              uuid primary key default gen_random_uuid(),
  code            text not null default upper(substr(md5(random()::text), 1, 6)),
  unit_id         uuid not null references public.lodging_units(id) on delete restrict,
  guest_name      text not null,
  guest_phone     text,
  guest_document  text,
  check_in        date not null,
  check_out       date not null,
  adults          integer not null default 1 check (adults >= 0),
  children        integer not null default 0 check (children >= 0),
  vehicle_plate   text,
  status          text not null default 'reserved'
                  check (status in (
                    'reserved', 'confirmed', 'checked_in', 'checked_out', 'cancelled'
                  )),
  nightly_rate    numeric(10, 2) not null default 0,
  total           numeric(10, 2) not null default 0,
  paid_amount     numeric(10, 2) not null default 0,
  seller_id       uuid references public.sellers(id) on delete set null,
  source          text,
  notes           text,
  checked_in_at   timestamptz,
  checked_out_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint lodging_stays_dates_chk check (check_out > check_in),
  constraint lodging_stays_guests_chk check (adults + children > 0)
);

create index if not exists lodging_stays_unit_dates_idx
  on public.lodging_stays (unit_id, check_in, check_out);
create index if not exists lodging_stays_status_idx
  on public.lodging_stays (status);

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.lodging_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists lodging_units_touch on public.lodging_units;
create trigger lodging_units_touch before update on public.lodging_units
  for each row execute function public.lodging_touch_updated_at();

drop trigger if exists lodging_stays_touch on public.lodging_stays;
create trigger lodging_stays_touch before update on public.lodging_stays
  for each row execute function public.lodging_touch_updated_at();

-- ---------------------------------------------------------------------
-- Bloqueio de overbooking (vale também para inserts fora do front)
-- ---------------------------------------------------------------------
create or replace function public.lodging_check_availability()
returns trigger language plpgsql as $$
declare
  u           public.lodging_units%rowtype;
  conflicts   integer;
  peak        integer;
begin
  if new.status = 'cancelled' then
    return new;
  end if;

  select * into u from public.lodging_units where id = new.unit_id;

  if u.booking_mode = 'exclusive' then
    if new.adults + new.children > u.capacity then
      raise exception 'Acomodação "%" comporta no máximo % pessoas.', u.name, u.capacity
        using errcode = 'P0001';
    end if;

    select count(*) into conflicts
      from public.lodging_stays s
     where s.unit_id = new.unit_id
       and s.id <> new.id
       and s.status <> 'cancelled'
       and s.check_in < new.check_out
       and s.check_out > new.check_in;

    if conflicts > 0 then
      raise exception 'Acomodação "%" já está ocupada nesse período.', u.name
        using errcode = 'P0001';
    end if;
  else
    -- maior ocupação em qualquer noite do período
    select coalesce(max(occ), 0) into peak
      from (
        select d, sum(s.adults + s.children) as occ
          from generate_series(new.check_in, new.check_out - 1, interval '1 day') d
          join public.lodging_stays s
            on s.unit_id = new.unit_id
           and s.id <> new.id
           and s.status <> 'cancelled'
           and s.check_in <= d::date
           and s.check_out > d::date
         group by d
      ) t;

    if peak + new.adults + new.children > u.capacity then
      raise exception 'Capacidade de "%" excedida: % de % vagas já ocupadas no período.',
        u.name, peak, u.capacity
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists lodging_stays_availability on public.lodging_stays;
create trigger lodging_stays_availability
  before insert or update of unit_id, check_in, check_out, adults, children, status
  on public.lodging_stays
  for each row execute function public.lodging_check_availability();

-- Acesso: o navegador nunca fala direto com o banco; a rota /api/db
-- exige sessão válida antes de qualquer consulta (sem RLS).
