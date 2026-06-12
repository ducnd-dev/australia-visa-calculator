# Production deploy — beta launch runbook

Single runbook for Phase 9 ops. **Do not onboard agencies until all stop gates pass.**

Related: [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md) · [BETA-ONBOARDING.md](./BETA-ONBOARDING.md) · [BETA-AGENCY-TRACKER.md](./BETA-AGENCY-TRACKER.md) · [BETA-LEARNINGS.md](./BETA-LEARNINGS.md)

### Quick status check

```bash
npm run go-live            # status + next operator step
npm run beta:gate-status   # which gates pass from local env
npm run print:vercel-env   # Vercel paste checklist (G5)
```

**Production URL (live):** https://australia-visa-calculator.vercel.app

Supabase → Authentication → URL configuration:
- Site URL: `https://australia-visa-calculator.vercel.app`
- Redirect URLs: `https://australia-visa-calculator.vercel.app/auth/callback`

Sync env to Vercel (after `.env.local` filled):

```bash
npm run push:vercel-env
npx vercel deploy --prod
```

4-week schedule: [WEEK-BY-WEEK-LAUNCH.md](./WEEK-BY-WEEK-LAUNCH.md)

**Current blockers (update after each gate passes):**

1. G2 one-liner (local + then mirror to Vercel):

```bash
RESEND_API_KEY=re_xxx LAUNCH_SITE_URL=https://your-app.vercel.app BETA_TEST_EMAIL=you@example.com npm run setup:launch-g2
```

2. `npx vercel login` → paste env vars → `npx vercel deploy --prod`
3. `npm run beta:complete-gates` (runs preflight, launch, smoke, test-email when env ready)

See [HUONG-DAN-LAY-KEY.md](./HUONG-DAN-LAY-KEY.md) § Resend for API key.

---

## Stop gates (G1–G9)

| Gate | Command / action | Pass | Date |
|------|------------------|------|------|
| **G1** | `npm run beta:launch` (local) | test + build + db:check | |
| **G2** | Vercel env vars (table below) | all required set | |
| **G3** | `npm run db:migrate` on production DB | 12 migrations applied | |
| **G4** | `npm run db:check` with prod env mirror | schema green | |
| **G5** | Vercel production deploy | URL live | |
| **G6** | `SMOKE_BASE_URL=https://... npm run beta:smoke` | automated pass | |
| **G7** | `BETA_TEST_EMAIL=... npm run beta:test-email` | inbox received | |
| **G8** | Manual smoke (7 steps — see smoke script output) | ticked | |
| **G9** | [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md) sections 1–7 | signed | |

Record gate dates in [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md) header when each passes.

---

## G1 — Local launch check

```bash
npm run beta:launch
```

Runs: `npm test` → `npm run build` → `npm run db:check` → `npm run beta:preflight`.

After deploy URL is known:

```bash
SMOKE_BASE_URL=https://your-domain.com npm run beta:launch -- --smoke
```

Phase 8 migrations (included in G3/G4):

- `20261001000000_share_password.sql`
- `20261002000000_enterprise_seats.sql`

---

## G2 — Vercel environment variables

### Step-by-step

1. **Import repo** to Vercel → Framework: Next.js → Node.js **20+**
2. **Settings → Environment Variables** → paste from `.env.local` (never commit secrets)
3. Set **Production** (and Preview if needed) for each variable
4. **Redeploy** after any env change (Deployments → … → Redeploy)

### Required for beta

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Production domain, no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | signup, share, team invites |
| `RESEND_API_KEY` | Yes | team invite + assessment email |
| `EMAIL_FROM_PLATFORM` or `EMAIL_FROM_DEFAULT_AGENCY` | Recommended | verified domain in production |
| `BASE_RPC_URL`, `BILLING_TREASURY_WALLET` | For billing | on-chain verify |
| `NEXT_PUBLIC_BILLING_TREASURY_WALLET`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | For billing UI | wallet pay |
| `CRON_SECRET` | Recommended | expire prepaid plans |
| `OPENAI_API_KEY` | Optional | AI explain |
| `R2_*`, `NEXT_PUBLIC_R2_PUBLIC_URL` | Optional | logo branding |

See [HUONG-DAN-LAY-KEY.md](./HUONG-DAN-LAY-KEY.md) for how to obtain each key.

### Webhooks (after G5 — use `NEXT_PUBLIC_SITE_URL`)

| Service | URL |
|---------|-----|
| Resend | `https://{your-domain}/api/email/webhooks/resend` |

Billing expiry cron (Vercel): `GET /api/cron/expire-billing` with `Authorization: Bearer CRON_SECRET`.

Resend: header `x-resend-webhook-secret` = `RESEND_WEBHOOK_SECRET`.

---

## G3 / G4 — Database

```bash
npm run db:migrate       # needs DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local
npm run db:build-apply-all
npm run db:check         # exits 1 if tables/columns missing
```

If production Supabase differs from local, run migrate against production credentials before G5.

---

## G5 — Deploy

```bash
vercel deploy --prod
# or push to main with Vercel Git integration
```

CI on every PR: `npm test` + `npm run build` (`.github/workflows/ci.yml`).

---

## G6 — Automated smoke

```bash
SMOKE_BASE_URL=https://your-domain.com npm run beta:smoke
```

Checks public routes + auth gates (export, PDF, billing confirm API).

---

## G7 — Test email

```bash
BETA_TEST_EMAIL=you@yourdomain.com npm run beta:test-email
```

Confirms `RESEND_API_KEY` and `EMAIL_FROM_*` work before agency onboard.

### Resend domain (recommended)

1. Add and verify domain in Resend (SPF/DKIM)
2. Set `EMAIL_FROM_PLATFORM` to e.g. `reports@yourdomain.com`
3. In app: Settings → save `from_domain` → **Check verification**
4. Run G7 again

**Gate:** Do not onboard until G7 passes and `NEXT_PUBLIC_SITE_URL` is production (not localhost).

---

## G8 — Manual smoke

Signed-in admin on **production**:

1. Sign up → dashboard
2. Client + ANZSCO → assessment → share link opens
3. Download PDF (`/api/assessments/[id]/pdf`) — logo + breakdown (Agency plan)
4. Enable share password → incognito → gate → unlock → results
5. Settings → team invite → `/login?invite=` uses production domain
6. Resend domain check (if custom `from_domain` set)
7. `/api/clients/export` returns CSV when authenticated

---

## G9 — QA sign-off

Use [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md) with **two browser profiles** (admin + agent).

Fix **blocker** bugs only before onboard.

---

## E3 — Agency onboarding

After G9 passes, track in [BETA-AGENCY-TRACKER.md](./BETA-AGENCY-TRACKER.md).

Week focus: [BETA-ONBOARDING.md](./BETA-ONBOARDING.md).

---

## E4 — Weekly metrics

```bash
npm run beta:metrics
```

30 min/week: metrics → blockers → [BETA-LEARNINGS.md](./BETA-LEARNINGS.md).

Optional: `NEXT_PUBLIC_GA_MEASUREMENT_ID` for compare page analytics.
