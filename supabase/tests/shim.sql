-- Minimal stand-in for what Supabase already provides, so the migration can be tested on plain Postgres.
-- DO NOT run this on Supabase.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
create schema extensions;
grant usage on schema extensions to anon, authenticated;
