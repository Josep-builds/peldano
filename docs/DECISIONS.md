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
