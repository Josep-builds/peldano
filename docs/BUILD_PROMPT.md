# Peldaño — Implementation Prompt (from PACKET.md)

> Paste this into the coding agent. Build ONLY what is listed. Anything not here is out of scope (see PACKET §8).

## Context
You are building Peldaño, a mobile-first web app in Spanish (es-MX). A worker gets a signed, locked record (*constancia*) of a trial day he did at a small business, and shares it with an employer who signed an *Acuerdo* that N signed trial days count as experience. Read `docs/CHARTER.md` (principles) and `docs/PACKET.md` (flow, data model, tests) first.

**Stack:** Next.js 15 App Router + TypeScript + Tailwind 4 · Supabase (Postgres + Auth with Google) via `@supabase/ssr` · zod · Vercel · domain peldano.xyz.

**Hard rules (fail = rebuild):**
1. No score/rating/stars column or UI anywhere.
2. A signed record cannot be updated or deleted — enforced by a Postgres trigger, not by the UI.
3. No DELETE on records for anyone.
4. RLS ON for every table; public reads only through `security definer` RPCs that take a token.
5. Tokens: 32 random bytes, stored as SHA-256 hex; never stored in plaintext.
6. No secrets in the repo. Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` env vars. No service-role key used at all.
7. Every form validated server-side with zod + DB CHECK constraints.
8. No AI in this build. Any example data on screen is labeled "Datos de ejemplo".

## Features (small, testable — build in this order)

### F1 · Skeleton + venture site
- `/` home: need in one sentence, who it's for, CTA "Entrar con Google". `/producto` how it works (3 steps). `/nosotros` the need, who pays (open), the 10:1 case with open assumptions stated honestly.
- **AC:** pages render on a 375px phone; no horizontal scroll; Lighthouse accessibility ≥ 90.

### F2 · Auth
- Google sign-in with Supabase; `/auth/callback` exchanges the code; middleware refreshes session; `/entrar?next=` page.
- **AC:** signed-out user visiting `/app` is redirected to `/entrar?next=/app`; after sign-in returns to `next` (only relative paths accepted).

### F3 · Database (`supabase/migrations/0001_init.sql`)
- Tables `records`, `acuerdos`, `shares` per PACKET §9 with CHECK constraints.
- Trigger `records_lock`: on UPDATE, if `old.signed_at is not null`, only `hidden` may change; on DELETE always raise.
- RPCs: `create_record(...)` returns sign token; `get_record_to_sign(token)`; `sign_record(token, tasks, observations, observer_name)`; `create_share(acuerdo_code, record_ids)` returns token; `get_share(token)`; `revoke_share(id)`; `get_acuerdo(code)`.
- **AC:** tests T3, T4, T5, T6 pass in the SQL editor.

### F4 · Worker: Mis constancias + nueva
- `/app` lists own records (draft / firmada · bloqueada / oculta). `/app/nueva` form: business, role, date, hours. On submit shows the sign link with "Enviar por WhatsApp" (`https://wa.me/?text=`) and "Copiar".
- **AC:** T1, T2 (first half).

### F5 · Observer: firmar
- `/firmar/[token]` (requires sign-in): shows business/role/date/hours; observer writes *Lo que hizo* (one task per line) and *Lo que vio*, types their name, ticks "Vi este trabajo en persona", signs. Shows the warning "Al firmar, la constancia queda bloqueada. No hay calificación." Observer cannot be the worker.
- **AC:** T2 complete, T5.

### F6 · Record view + hide
- `/app/c/[id]` matches `docs/mockup.png`: business card, Lo que hizo, Lo que vio quien firma, badge "Firmada por X · bloqueada", buttons Compartir / Ocultar (Mostrar).
- **AC:** T7.

### F7 · Acuerdo
- `/acuerdo/nuevo` (signed-in employer): business name, N (1–10), fixed statement "Aceptamos N constancias firmadas de días de prueba como experiencia para puestos de entrada. No es una promesa de contratación." → public code + link. `/acuerdo/[code]` public page showing it.
- **AC:** N outside 1–10 rejected.

### F8 · Share + employer view + revoke
- From a record: worker enters an Acuerdo code, picks signed records → share link. `/ver/[token]` public: the Acuerdo, the shared records, "X de N días de prueba". `/app/compartidos` list with "Revocar".
- **AC:** T7, T8, T9.

## Commit plan (min. 5 commits, 2 deploys)
1. `docs: charter, personas, packet, mockup, build prompt`
2. `feat: next.js skeleton + venture site (home, producto, nosotros)` → **deploy 1** to peldano.xyz
3. `feat: supabase google auth + middleware`
4. `feat(db): tables, RLS, lock trigger, RPCs`
5. `feat: worker creates trial day + whatsapp sign link`
6. `feat: observer signs; record locks`
7. `feat: acuerdo + share + employer view + revoke` → **deploy 2**
8. `fix: <bug found in mechanical pass>` → **deploy 3**

## Session Close (every session)
Update `docs/DECISIONS.md` (what was decided and why, tomorrow's first move), commit, push.
