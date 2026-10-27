# Peldaño — Decisions log

Every session ends here: what was decided, why, and tomorrow's first move.

---

## Session 1 · 26–27 Oct 2026 — Charter → Personas → Packet → Core build

**Decisions**

| # | Decision | Why |
|---|---|---|
| D1 | Rebuild from zero in a new repo (`peldano`) instead of patching the W9 `pelda-o` repo. | Crystal Ball: the chosen ship is rebuilt, not patched. The W9 build had dropped the employer waiver. |
| D2 | Split "employer" into **Observer** (signs the trial day) and **Receiving employer** (signs the Acuerdo and reads shared records). | The Verdict merged them in one sentence; in practice they are usually different businesses. |
| D3 | Target small cafés/restaurants/shops, not nearshoring warehouses. | Interview 26 Oct: the big-chain trial was a paid 8-hour shift; unpaid trials live in small businesses. |
| D4 | No AI in week 12. | Scope: the core is the lock. Method Step 6 allows AI only to *read*; nothing to read yet. |
| D5 | The lock lives in Postgres (trigger + no write policies + `security definer` RPCs), not in the UI. | Method Step 7: "enforced in the database, not in the copy." Trigger applies even to the service role. |
| D6 | No service-role key anywhere in the app. Only the public anon key + RLS + narrow RPCs. | Security Floor; nothing secret can leak from the repo or the browser. |
| D7 | Sign and share tokens = 32 random bytes, stored only as SHA-256. Sign links: one use, 7 days. | A leaked database dump can't be used to sign or read records. |
| D8 | Records can be **hidden**, never deleted. | Charter principle 3–4 (W9 shadow decision): a bad day can't bury anyone, and nobody can erase a worker's record. |
| D9 | The worker's name is typed on the record (pre-filled from Google) and locked at signing. | The observer and the receiving employer need to know whose work it is; Google display names are often nicknames. |
| D10 | The Acuerdo text is fixed and always says "No es una promesa de contratación." | Risk #1: small businesses fear legal exposure; the Acuerdo must commit only to counting experience. |
| D11 | Sharing via `wa.me` links, no messaging API. | Free, and it's the channel the worker already uses. |
| D12 | Fonts self-hosted via `@fontsource-variable/figtree`. | No external font request; build works offline. |
| D13 | Kept Next.js 15 (not 16). `npm audit` flags a postcss version bundled inside Next; it's build-time only. | Next 16 renames middleware and changes APIs; not worth the risk this week. Revisit week 16 (security). |
| D14 | `/producto` shows an example record labeled "Datos de ejemplo". | Lets the persona test and the demo show the core screen without real data. |

**Mechanical test pass (local)**

| Test | Result |
|---|---|
| T1 invalid input | ✅ zod (app) + CHECK constraints (DB) — `supabase/tests/db_test.sql` |
| T3 edit signed record | ✅ blocked by trigger, even as table owner |
| T4 delete any record | ✅ blocked (signed and unsigned) |
| T5 reuse sign link | ✅ "Este enlace ya no es válido" |
| T6 RLS | ✅ stranger sees 0 rows; anon can't read tables |
| T7 hide → leaves share | ✅ |
| T8 revoke | ✅ employer view shows "Enlace revocado", no records |
| T9 "X de N" | ✅ 2 de 3 |
| T10 secrets in repo | ✅ none (only a package-lock hash matched the pattern) |
| T2, T11 full flow on peldano.xyz | ⏳ after Supabase + Vercel + domain are connected |
| Mobile, 390px | ✅ no horizontal scroll on public pages |

**Bug found → fixed:** the signed timestamp rendered "08:15 p.m.." (double period: es-MX time format ends in "p.m." and the sentence added another). Fixed by using a separator `·`. → commit `fix:`, redeploy.

**Tomorrow's first move:** create the Supabase project, run `0001_init.sql`, turn on Google sign-in, deploy to Vercel, point peldano.xyz, and run T2 + T11 with two Google accounts (worker on phone, observer on laptop). Then run the persona test (Iván, Rosa).

---

## Session 2 · 27 Oct 2026 — Publish: GitHub, Supabase, Vercel, domain

**D15 — Found and relocated stray W9 (`pelda-o`) leftovers.** The working directory had untracked, root-level `app/`, `components/`, `lib/`, `public/*.svg`, `scripts/`, `proxy.ts`, `eslint.config.mjs`, and `docs/IMPLEMENTATION_PROMPT.md` — the old AI-extraction/Ed25519-attestation build (D1's "not this one"). They were never committed, but Next.js was silently building from the root `app/` instead of the real `src/app/`, and that tree is incomplete (missing `lib/attestations/*`, `lib/supabase/admin.ts`), which broke the first `vercel --prod` build. Moved everything out of `~/peldano` to a scratch backup (not deleted) before redeploying. **Why:** a local-upload Vercel deploy would otherwise have shipped the wrong app entirely. **Also found:** two extra migration files on disk, `0002_evidence_bucket_limits.sql` and `0003_fix_observer_fk_on_delete.sql`, from the same old project (reference a `entries` table and an `evidence` bucket that don't exist in this schema) — relocated alongside, not pushed to the DB.

**D16 — Supabase CLI `link` doesn't work with the browser-login session token.** `supabase link --project-ref ...` failed with `LinkAuthTokenError` / insufficient privileges, even though the same token could list projects and read API keys. Worked around by pushing migrations with `supabase db push --project-ref ... ` + `SUPABASE_DB_PASSWORD` env var (direct Postgres connection), skipping `link` entirely. **Why:** avoids depending on a Management-API scope the CLI session didn't have; no project settings were touched to work around it.

**Done**

| # | Step | Result |
|---|---|---|
| 1 | GitHub | Pushed full history (9 commits) to `Josep-builds/peldano` (public). |
| 2 | Supabase | Linked to `okiebjcsugsroshxmovf` (peldano-venture) via direct DB connection; pushed `0001_init.sql` only. Verified `records`/`acuerdos`/`shares` + all RPCs exist via anonymous REST calls (permission-denied on tables/`create_record`, 200 on public `get_acuerdo`/`get_share`) rather than the service-role key, which was never used or stored. |
| 3 | Vercel | Project `peldano` created, linked to the GitHub repo. Env vars set for Production + Preview: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (new-style `sb_publishable_...` key), `NEXT_PUBLIC_SITE_URL=https://peldano.xyz`. Deployed to production twice (initial build + after D17 below). |
| 4 | Domain | `peldano.xyz` + `www.peldano.xyz` added to the Vercel project (domain bought by Josep directly through Vercel's own registrar beforehand — confirmed before touching anything, no new purchase triggered). DNS/nameservers not yet propagated as of session end. |
| 5 | Auth | Josep configured `site_url`, redirect URLs, and the Google OAuth provider (Client ID/Secret) directly in the Supabase dashboard — no Management API call made, no token needed. |
| 6 | Privacy page | Added `/privacidad` (data stored, purpose, no third-party sharing, hide-not-delete, contact) + footer link. Local `node_modules` was stale (had Next 16.3.8 + missing `@fontsource-variable/figtree` instead of the pinned `^15.5.28`) — reinstalled clean before verifying the build. |

**Open for next session:** confirm `peldano.xyz` DNS has propagated to Vercel's nameservers (`ns1`/`ns2.vercel-dns.com`) and run T2 + T11 live with two Google accounts.
