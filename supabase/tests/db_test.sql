-- Peldaño · database tests (T3–T9 from PACKET §11)
-- Runs against a plain Postgres 16 with a minimal Supabase shim (supabase/tests/shim.sql) + 0001_init.sql.
-- Every check raises on failure; the run ends with 'ALL DB TESTS PASSED'.
\set ON_ERROR_STOP 1
set client_min_messages = warning;

insert into auth.users(id) values
  ('00000000-0000-0000-0000-00000000000a'),  -- worker  (Iván, ejemplo)
  ('00000000-0000-0000-0000-00000000000b'),  -- observer (Rosa, ejemplo)
  ('00000000-0000-0000-0000-00000000000c'),  -- employer (ejemplo)
  ('00000000-0000-0000-0000-00000000000d');  -- stranger

create temp table t (k text primary key, v text);
grant all on t to authenticated, anon;

-- ── Worker creates a record ─────────────────────────────────
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a', false);
insert into t select 'rec', id::text from public.create_record('Iván (ejemplo)','Café La Esquina (ejemplo)','Barista', current_date - 2, 6);
insert into t select 'tok', token from public.create_record('Iván (ejemplo)','Café La Esquina (ejemplo)','Barista', current_date - 1, 5);
update t set k = 'tok2' where k = 'tok';
insert into t select 'tok', token from public.create_record('Iván (ejemplo)','Taquería Sol (ejemplo)','Mesero', current_date - 3, 6);

-- T1: invalid input rejected
do $$ begin
  begin perform public.create_record('I','Café','Barista', current_date, 6); raise exception 'T1a FAIL';
  exception when check_violation then null; end;
  begin perform public.create_record('Iván','Café','Barista', current_date + 1, 6); raise exception 'T1b FAIL';
  exception when invalid_parameter_value then null; end;
  begin perform public.create_record('Iván','Café','Barista', current_date, 20); raise exception 'T1c FAIL';
  exception when check_violation then null; end;
end $$;

-- Worker cannot insert/update/delete directly
do $$ begin
  begin insert into public.records(worker_id, worker_name, business_name, role, trial_date, hours)
        values (auth.uid(),'Iván','Café','Barista', current_date, 6); raise exception 'direct insert FAIL';
  exception when insufficient_privilege then null; end;
end $$;

-- Worker cannot sign own record
do $$ begin
  begin perform public.sign_record((select v from t where k='tok'),'Preparó bebidas de café','Llegó puntual y atendió bien','Iván'); raise exception 'self-sign FAIL';
  exception when insufficient_privilege then null; end;
end $$;

-- ── Observer signs ──────────────────────────────────────────
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000b', false);
do $$ begin
  if (select is_own from public.get_record_to_sign((select v from t where k='tok'))) is not false then raise exception 'get_record_to_sign FAIL'; end if;
end $$;
insert into t select 'signed', public.sign_record((select v from t where k='tok'),
  E'Tomó órdenes en mesa\nLlevó platos', 'Atendió seis mesas sin ayuda después de la primera hora.', 'Rosa M. (ejemplo)')::text;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000b', false);
insert into t select 'signed2', public.sign_record((select v from t where k='tok2'),
  E'Preparó espressos y lattes\nCobró en caja', 'Aprendió la máquina rápido; cuadró la caja al cierre.', 'Rosa M. (ejemplo)')::text;

-- T5: link is one-time
do $$ begin
  if exists (select 1 from public.get_record_to_sign((select v from t where k='tok'))) then raise exception 'T5a FAIL'; end if;
  begin perform public.sign_record((select v from t where k='tok'),'otra cosa larga','otra cosa larga','X Y'); raise exception 'T5b FAIL';
  exception when invalid_parameter_value then null; end;
end $$;

-- ── T3/T4: the lock (even as the table owner / service role) ───
reset role;
do $$ begin
  begin update public.records set tasks = 'Cambiado después de firmar' where id = (select v from t where k='signed')::uuid; raise exception 'T3 FAIL';
  exception when insufficient_privilege then null; end;
  begin delete from public.records where id = (select v from t where k='signed')::uuid; raise exception 'T4a FAIL';
  exception when insufficient_privilege then null; end;
  begin delete from public.records where signed_at is null; raise exception 'T4b FAIL (unsigned delete)';
  exception when insufficient_privilege then null; end;
end $$;

-- T6: RLS — stranger sees nothing; worker sees own 3
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000d', false);
do $$ begin if (select count(*) from public.records) <> 0 then raise exception 'T6a FAIL'; end if; end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a', false);
do $$ begin if (select count(*) from public.records) <> 3 then raise exception 'T6b FAIL'; end if; end $$;
reset role; set role anon; select set_config('request.jwt.claim.sub','', false);
do $$ begin
  begin perform 1 from public.records; raise exception 'T6c FAIL (anon read)';
  exception when insufficient_privilege then null; end;
end $$;

-- ── Acuerdo ─────────────────────────────────────────────────
reset role; set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c', false);
do $$ begin
  begin perform public.create_acuerdo('Restaurante Norte (ejemplo)','Laura P.', 11); raise exception 'N>10 FAIL';
  exception when check_violation then null; end;
end $$;
insert into t select 'code', public.create_acuerdo('Restaurante Norte (ejemplo)','Laura P. (ejemplo)', 3);

-- ── Share (worker) ──────────────────────────────────────────
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a', false);
do $$ begin  -- cannot share an unsigned record
  begin perform public.create_share((select v from t where k='code'), array[(select v from t where k='rec')::uuid]); raise exception 'share unsigned FAIL';
  exception when insufficient_privilege then null; end;
end $$;
insert into t select 'share', public.create_share(lower((select v from t where k='code')),
  array[(select v from t where k='signed')::uuid, (select v from t where k='signed2')::uuid]);

-- T9: employer (anon) sees 2 de 3
reset role; set role anon;
do $$ declare j jsonb := public.get_share((select v from t where k='share')); begin
  if jsonb_array_length(j->'records') <> 2 or (j->'acuerdo'->>'n_days')::int <> 3 then raise exception 'T9 FAIL %', j; end if;
  if j::text ~* 'score|rating|estrell' then raise exception 'score leaked'; end if;
end $$;

-- T7: hide → disappears from employer view; hide is allowed on a signed record
reset role; set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a', false);
select public.set_record_hidden((select v from t where k='signed2')::uuid, true);
reset role; set role anon;
do $$ begin if jsonb_array_length(public.get_share((select v from t where k='share'))->'records') <> 1 then raise exception 'T7 FAIL'; end if; end $$;

-- Stranger cannot hide someone else's record or revoke their share
reset role; set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000d', false);
do $$ begin
  begin perform public.set_record_hidden((select v from t where k='signed')::uuid, true); raise exception 'foreign hide FAIL';
  exception when insufficient_privilege then null; end;
  begin perform public.revoke_share((select id from public.shares limit 1)); raise exception 'foreign revoke FAIL';
  exception when insufficient_privilege then null; end;
end $$;

-- T8: revoke
reset role;
insert into t select 'share_id', id::text from public.shares limit 1;
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a', false);
select public.revoke_share((select v from t where k='share_id')::uuid);
reset role; set role anon;
do $$ declare j jsonb := public.get_share((select v from t where k='share')); begin
  if not (j->>'revoked')::boolean or jsonb_array_length(j->'records') <> 0 then raise exception 'T8 FAIL'; end if;
end $$;

-- Tokens are never stored in plaintext
reset role;
do $$ begin
  if exists (select 1 from public.shares s where s.token_hash = (select v from t where k='share')) then raise exception 'plaintext token FAIL'; end if;
end $$;

-- Anon cannot call write RPCs
set role anon;
do $$ begin
  begin perform public.create_acuerdo('X X','Y Y', 2); raise exception 'anon write FAIL';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

select 'ALL DB TESTS PASSED' as result;
