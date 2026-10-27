-- Peldaño · 0001_init.sql
-- Method Step 7 lives here: no scores, no self-closing, a signed record is locked BY THE DATABASE.
-- Run once in Supabase → SQL Editor (or `supabase db push`).

create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────
create or replace function public.peldano_new_token()
returns text language sql volatile
set search_path = ''
as $$ select encode(extensions.gen_random_bytes(32), 'hex') $$;

create or replace function public.peldano_hash(p_token text)
returns text language sql immutable
set search_path = ''
as $$ select encode(extensions.digest(p_token, 'sha256'), 'hex') $$;

-- ─────────────────────────────────────────────────────────────
-- records (constancias) — NOTE: there is no score/rating column, on purpose.
-- ─────────────────────────────────────────────────────────────
create table public.records (
  id                uuid primary key default gen_random_uuid(),
  worker_id         uuid not null references auth.users(id) on delete restrict,
  worker_name       text not null check (char_length(worker_name) between 2 and 80),
  business_name     text not null check (char_length(business_name) between 2 and 80),
  role              text not null check (char_length(role) between 2 and 80),
  trial_date        date not null check (trial_date >= date '2020-01-01'),
  hours             smallint not null check (hours between 1 and 14),
  tasks             text check (tasks is null or char_length(tasks) between 10 and 1000),
  observations      text check (observations is null or char_length(observations) between 10 and 1000),
  observer_id       uuid references auth.users(id) on delete restrict,
  observer_name     text check (observer_name is null or char_length(observer_name) between 2 and 80),
  signed_at         timestamptz,
  hidden            boolean not null default false,
  sign_token_hash   text unique,
  token_expires_at  timestamptz,
  created_at        timestamptz not null default now(),
  -- a signed record must be complete, and must not be signed by its own worker
  constraint signed_is_complete check (
    signed_at is null
    or (tasks is not null and observations is not null and observer_id is not null and observer_name is not null)
  ),
  constraint no_self_signing check (observer_id is null or observer_id <> worker_id)
);

create index records_worker_idx on public.records(worker_id);

-- The lock: once signed, only `hidden` may change. Nobody can delete. Applies to every role, incl. service role.
create or replace function public.records_lock()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Peldaño: records cannot be deleted' using errcode = '42501';
  end if;

  if old.signed_at is not null then
    if (new.worker_id, new.worker_name, new.business_name, new.role, new.trial_date, new.hours,
        new.tasks, new.observations, new.observer_id, new.observer_name, new.signed_at,
        new.sign_token_hash, new.token_expires_at, new.created_at, new.id)
       is distinct from
       (old.worker_id, old.worker_name, old.business_name, old.role, old.trial_date, old.hours,
        old.tasks, old.observations, old.observer_id, old.observer_name, old.signed_at,
        old.sign_token_hash, old.token_expires_at, old.created_at, old.id) then
      raise exception 'Peldaño: a signed record is locked' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

create trigger records_lock_update before update on public.records
  for each row execute function public.records_lock();
create trigger records_lock_delete before delete on public.records
  for each row execute function public.records_lock();

alter table public.records enable row level security;

-- Read: the worker sees own records; the observer sees records they signed. No write policies: writes go through RPCs.
create policy records_select_own on public.records
  for select to authenticated
  using (worker_id = auth.uid() or observer_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- acuerdos — an employer's prior commitment: N signed records count as experience. Not a hiring promise.
-- ─────────────────────────────────────────────────────────────
create table public.acuerdos (
  id             uuid primary key default gen_random_uuid(),
  employer_id    uuid not null references auth.users(id) on delete restrict,
  business_name  text not null check (char_length(business_name) between 2 and 80),
  signer_name    text not null check (char_length(signer_name) between 2 and 80),
  n_days         smallint not null check (n_days between 1 and 10),
  public_code    text not null unique check (public_code ~ '^[A-F0-9]{8}$'),
  signed_at      timestamptz not null default now()
);

alter table public.acuerdos enable row level security;

create policy acuerdos_select_own on public.acuerdos
  for select to authenticated
  using (employer_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- shares — a worker-controlled, revocable link from chosen records to one acuerdo
-- ─────────────────────────────────────────────────────────────
create table public.shares (
  id           uuid primary key default gen_random_uuid(),
  worker_id    uuid not null references auth.users(id) on delete restrict,
  acuerdo_id   uuid not null references public.acuerdos(id) on delete restrict,
  record_ids   uuid[] not null check (cardinality(record_ids) between 1 and 10),
  token_hash   text not null unique,
  created_at   timestamptz not null default now(),
  revoked_at   timestamptz
);

create index shares_worker_idx on public.shares(worker_id);

alter table public.shares enable row level security;

create policy shares_select_own on public.shares
  for select to authenticated
  using (worker_id = auth.uid());

-- Tables are never readable by anonymous users; authenticated users are filtered by RLS.
revoke all on public.records, public.acuerdos, public.shares from anon, authenticated;
grant select on public.records, public.acuerdos, public.shares to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RPCs (security definer, narrow, validated)
-- ─────────────────────────────────────────────────────────────

-- Worker creates a trial day → returns a one-time sign token (plaintext only here, never stored)
create or replace function public.create_record(
  p_worker_name text, p_business_name text, p_role text, p_trial_date date, p_hours int
) returns table (id uuid, token text)
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_token text := public.peldano_new_token();
  v_id uuid;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if p_trial_date > current_date or p_trial_date < current_date - 365 then
    raise exception 'La fecha debe estar dentro del último año' using errcode = '22023';
  end if;

  insert into public.records (worker_id, worker_name, business_name, role, trial_date, hours,
                              sign_token_hash, token_expires_at)
  values (v_uid, btrim(p_worker_name), btrim(p_business_name), btrim(p_role), p_trial_date, p_hours,
          public.peldano_hash(v_token), now() + interval '7 days')
  returning records.id into v_id;

  return query select v_id, v_token;
end $$;

-- Worker regenerates the sign link of an UNSIGNED own record (old link stops working)
create or replace function public.renew_sign_token(p_record_id uuid)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  v_token text := public.peldano_new_token();
begin
  update public.records
     set sign_token_hash = public.peldano_hash(v_token),
         token_expires_at = now() + interval '7 days'
   where id = p_record_id and worker_id = auth.uid() and signed_at is null;
  if not found then raise exception 'not allowed' using errcode = '42501'; end if;
  return v_token;
end $$;

-- Observer opens a sign link
create or replace function public.get_record_to_sign(p_token text)
returns table (worker_name text, business_name text, role text, trial_date date, hours smallint, is_own boolean)
language sql security definer stable
set search_path = ''
as $$
  select r.worker_name, r.business_name, r.role, r.trial_date, r.hours, (r.worker_id = auth.uid())
    from public.records r
   where auth.uid() is not null
     and r.sign_token_hash = public.peldano_hash(p_token)
     and r.signed_at is null
     and r.token_expires_at > now()
$$;

-- Observer signs → record locks; the link dies
create or replace function public.sign_record(
  p_token text, p_tasks text, p_observations text, p_observer_name text
) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_worker uuid;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;

  select r.id, r.worker_id into v_id, v_worker
    from public.records r
   where r.sign_token_hash = public.peldano_hash(p_token)
     and r.signed_at is null
     and r.token_expires_at > now()
   for update;

  if v_id is null then raise exception 'Este enlace ya no es válido' using errcode = '22023'; end if;
  if v_worker = v_uid then raise exception 'No puedes firmar tu propia constancia' using errcode = '42501'; end if;

  update public.records
     set tasks = btrim(p_tasks),
         observations = btrim(p_observations),
         observer_name = btrim(p_observer_name),
         observer_id = v_uid,
         signed_at = now(),
         sign_token_hash = null,
         token_expires_at = null
   where id = v_id;

  return v_id;
end $$;

-- Worker hides / shows own record (never deletes)
create or replace function public.set_record_hidden(p_record_id uuid, p_hidden boolean)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  update public.records set hidden = p_hidden
   where id = p_record_id and worker_id = auth.uid();
  if not found then raise exception 'not allowed' using errcode = '42501'; end if;
end $$;

-- Employer signs an acuerdo → returns its public code
create or replace function public.create_acuerdo(p_business_name text, p_signer_name text, p_n_days int)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  loop
    v_code := upper(encode(extensions.gen_random_bytes(4), 'hex'));
    exit when not exists (select 1 from public.acuerdos a where a.public_code = v_code);
  end loop;
  insert into public.acuerdos (employer_id, business_name, signer_name, n_days, public_code)
  values (v_uid, btrim(p_business_name), btrim(p_signer_name), p_n_days, v_code);
  return v_code;
end $$;

-- Anyone with the code can read the acuerdo's public face
create or replace function public.get_acuerdo(p_code text)
returns table (business_name text, signer_name text, n_days smallint, signed_at timestamptz)
language sql security definer stable
set search_path = ''
as $$
  select a.business_name, a.signer_name, a.n_days, a.signed_at
    from public.acuerdos a
   where a.public_code = upper(btrim(p_code))
$$;

-- Worker shares chosen signed, visible records with one acuerdo → returns token
create or replace function public.create_share(p_code text, p_record_ids uuid[])
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_acuerdo uuid;
  v_token text := public.peldano_new_token();
  v_ids uuid[];
begin
  if v_uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;

  select a.id into v_acuerdo from public.acuerdos a where a.public_code = upper(btrim(p_code));
  if v_acuerdo is null then raise exception 'No encontramos ese Acuerdo' using errcode = '22023'; end if;

  select array_agg(distinct x) into v_ids from unnest(p_record_ids) x;
  if v_ids is null or cardinality(v_ids) not between 1 and 10 then
    raise exception 'Elige entre 1 y 10 constancias' using errcode = '22023';
  end if;

  if exists (
    select 1 from unnest(v_ids) x
     where not exists (select 1 from public.records r
                        where r.id = x and r.worker_id = v_uid and r.signed_at is not null and not r.hidden)
  ) then
    raise exception 'Solo puedes compartir constancias firmadas y visibles' using errcode = '42501';
  end if;

  insert into public.shares (worker_id, acuerdo_id, record_ids, token_hash)
  values (v_uid, v_acuerdo, v_ids, public.peldano_hash(v_token));
  return v_token;
end $$;

-- Worker revokes a share
create or replace function public.revoke_share(p_share_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  update public.shares set revoked_at = now()
   where id = p_share_id and worker_id = auth.uid() and revoked_at is null;
  if not found then raise exception 'not allowed' using errcode = '42501'; end if;
end $$;

-- Worker lists own shares with the acuerdo's public face (workers can't read the acuerdos table directly)
create or replace function public.list_my_shares()
returns table (id uuid, created_at timestamptz, revoked_at timestamptz, business_name text, n_days smallint, n_records int)
language sql security definer stable
set search_path = ''
as $$
  select s.id, s.created_at, s.revoked_at, a.business_name, a.n_days, cardinality(s.record_ids)
    from public.shares s
    join public.acuerdos a on a.id = s.acuerdo_id
   where s.worker_id = auth.uid()
   order by s.created_at desc
$$;

-- Employer opens a share link. Hidden records disappear immediately; revoked links show nothing.
create or replace function public.get_share(p_token text)
returns jsonb
language sql security definer stable
set search_path = ''
as $$
  select jsonb_build_object(
    'revoked', s.revoked_at is not null,
    'acuerdo', jsonb_build_object('business_name', a.business_name, 'signer_name', a.signer_name,
                                  'n_days', a.n_days, 'signed_at', a.signed_at),
    'records', case when s.revoked_at is not null then '[]'::jsonb else coalesce((
      select jsonb_agg(jsonb_build_object(
               'worker_name', r.worker_name, 'business_name', r.business_name, 'role', r.role,
               'trial_date', r.trial_date, 'hours', r.hours, 'tasks', r.tasks,
               'observations', r.observations, 'observer_name', r.observer_name,
               'signed_at', r.signed_at) order by r.trial_date)
        from public.records r
       where r.id = any (s.record_ids)
         and r.worker_id = s.worker_id
         and r.signed_at is not null
         and not r.hidden), '[]'::jsonb) end
  )
  from public.shares s
  join public.acuerdos a on a.id = s.acuerdo_id
  where s.token_hash = public.peldano_hash(p_token)
$$;

-- ─────────────────────────────────────────────────────────────
-- Execute grants: nothing callable by default; then the minimum.
-- ─────────────────────────────────────────────────────────────
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.create_record(text, text, text, date, int)      to authenticated;
grant execute on function public.renew_sign_token(uuid)                           to authenticated;
grant execute on function public.get_record_to_sign(text)                         to authenticated;
grant execute on function public.sign_record(text, text, text, text)              to authenticated;
grant execute on function public.set_record_hidden(uuid, boolean)                 to authenticated;
grant execute on function public.create_acuerdo(text, text, int)                  to authenticated;
grant execute on function public.create_share(text, uuid[])                       to authenticated;
grant execute on function public.revoke_share(uuid)                               to authenticated;
grant execute on function public.list_my_shares()                                 to authenticated;
grant execute on function public.get_acuerdo(text)                                to anon, authenticated;
grant execute on function public.get_share(text)                                  to anon, authenticated;
