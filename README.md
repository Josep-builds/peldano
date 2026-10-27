# Peldaño

**Tu día de prueba sí cuenta.** A signed, timestamped, locked record of a trial day, owned by the worker, shared with employers who agreed beforehand that N such days count as experience.

Live: **https://peldano.xyz** · Docs: [`docs/CHARTER.md`](docs/CHARTER.md) · [`docs/PERSONAS.md`](docs/PERSONAS.md) · [`docs/PACKET.md`](docs/PACKET.md) · [`docs/DECISIONS.md`](docs/DECISIONS.md)

Stack: Next.js 15 · Tailwind 4 · Supabase (Postgres + Google Auth) · Vercel.

---

## Setup (once, ~30 min)

### 1. Supabase
1. Create a project at supabase.com (sign in with the venture Gmail). Region: closest to Mexico (e.g. `us-east-1`).
2. **SQL Editor → New query** → paste all of `supabase/migrations/0001_init.sql` → **Run**.
3. **Authentication → Sign In / Providers → Google → Enable.** You need a Google OAuth Client ID + Secret:
   - console.cloud.google.com → new project "Peldaño" → **APIs & Services → OAuth consent screen** (External, app name Peldaño, your venture email).
   - **Credentials → Create credentials → OAuth client ID → Web application.**
   - *Authorized redirect URI:* copy the **Callback URL** shown in Supabase's Google provider page (looks like `https://XXXX.supabase.co/auth/v1/callback`).
   - Paste the Client ID and Secret back into Supabase → Save.
4. **Authentication → URL Configuration:**
   - Site URL: `https://peldano.xyz`
   - Redirect URLs: `https://peldano.xyz/auth/callback`, `http://localhost:3000/auth/callback`, `https://*.vercel.app/auth/callback`
5. **Project Settings → API:** copy the *Project URL* and the *anon public* key. (Never copy the service_role key anywhere — the app doesn't use it.)

### 2. GitHub
Create an empty repo (e.g. `Josep-builds/peldano`) and push:
```bash
git remote add origin https://github.com/Josep-builds/peldano.git
git push -u origin main
```

### 3. Vercel
1. vercel.com → **Add New → Project** → import the repo.
2. **Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
   - `NEXT_PUBLIC_SITE_URL` = `https://peldano.xyz`
3. Deploy.

### 4. Domain
1. Buy `peldano.xyz` (Namecheap / Porkbun / Cloudflare) with the venture Gmail.
2. Vercel → Project → **Settings → Domains → Add** `peldano.xyz` (and `www.peldano.xyz`).
3. At the registrar, set the DNS records Vercel shows (usually `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`). Wait for the green check.

### 5. Smoke test (T2 + T11)
On your phone (worker account): peldano.xyz → Entrar → Nuevo día de prueba → send link to yourself on WhatsApp. On a laptop with a **different** Google account (observer): open the link → sign. Back on the phone: record shows *Firmada · bloqueada*. Then with a third account: `/acuerdo/nuevo` → get code → share from the phone → open the link logged out → "1 de N".

## Local development
```bash
cp .env.example .env.local   # fill in the two Supabase values; SITE_URL=http://localhost:3000
npm install
npm run dev
```

## Database tests
`supabase/tests/db_test.sql` checks the lock, RLS, one-time links, hide, share and revoke (T1, T3–T9). It runs on plain Postgres 16 with `supabase/tests/shim.sql` (never run the shim on Supabase):
```bash
createdb peldano_test
psql -d peldano_test -f supabase/tests/shim.sql -f supabase/migrations/0001_init.sql -f supabase/tests/db_test.sql
# → ALL DB TESTS PASSED
```

## Security floor
- No secrets in the repo; env vars only in Vercel. No service-role key used.
- Google sign-in for anyone who writes data.
- RLS on every table; anonymous users read only through `get_share` / `get_acuerdo` with a token or code.
- Every form validated with zod + DB CHECK constraints.
- Demo data is invented and labeled "Datos de ejemplo".
