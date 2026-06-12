# Australia Visa Points Calculator

Schedule 6D points calculator for Australian skilled migration (**subclasses 189, 190, 491**). Built for **migration agents** (practice workspace) and **applicants** (free public calculator).

**Production:** [australia-visa-calculator.vercel.app](https://australia-visa-calculator.vercel.app) (when deployed)

This tool provides **estimates only** — not migration advice. Confirm scores on official Home Affairs sources before lodging an EOI.

---

## What it does

### Public (no account)

| Feature | Route |
|---------|--------|
| Points wizard (189 / 190 / 491) | `/calculator` |
| Shareable results | `/results?d=…` |
| Visa directory & guides | `/visas`, `/blog`, `/faq` |
| Pathway scores & gap-to-target suggestions | Built into results |

### Practice workspace (migration agents)

| Feature | Route / location |
|---------|------------------|
| Dashboard with stats, onboarding checklist, **needs attention** queue | `/app` |
| Client CRM (search, status tags, archive, ANZSCO) | `/app/clients` |
| Saved assessments (same Schedule 6D engine as public) | `/app/assessments/new` |
| Points breakdown chart, PDF preview, AI explain & draft notes | `/app/assessments/[id]` |
| Compare two assessments | `/app/clients/[id]/compare` |
| Client timeline (assessments, emails, share events) | Client detail |
| Branded share links (optional password, expiry, revoke) | `/share/[token]` |
| Email assessment report + quick-send templates | Client / assessment actions |
| Marketing campaigns (consented clients) | `/app/marketing` |
| Team invites, MARA profile, logo, email templates | `/app/settings` |
| Billing (Trial → Professional) | `/app/billing` |

### Platform admin

| Feature | Route |
|---------|--------|
| Platform newsletters | `/admin/marketing` |

Requires `profiles.role = 'super_admin'` in Supabase.

---

## Plans

| | **Public** | **Trial** | **Professional** |
|---|------------|-----------|------------------|
| Calculator | Yes | Yes | Yes |
| Client files & assessments | — | Yes | Yes |
| Share links & transactional email | — | Yes | Yes |
| AI explain & draft (monthly limits) | — | Yes | Higher limits |
| Marketing sends | — | Limited | Higher limits |
| PDF export & practice logo on share | — | — | Yes |

Upgrade from **Billing** after sign-in. Pay with USDC on Base (prepaid 30 days per payment).

---

## Stack

- **Next.js 16** (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Points engine** — deterministic Schedule 6D rules in `src/lib/visa-rules/gsm/` (not AI)
- **Supabase** — auth, Postgres, RLS
- **USDC on Base** — prepaid Professional billing (wagmi + viem)
- **Resend** — transactional email & campaigns
- **OpenAI** — optional AI explain / draft notes (points never recalculated by AI)
- **Cloudflare R2** — optional practice logo storage
- **Vercel** — hosting; weekly practice digest cron (`vercel.json`)

---

## Development

```bash
npm install
npm run setup:env    # .env.local from .env.example (webhook secrets auto-generated)
# Edit .env.local — see .env.example sections (LOCAL / BOTH / Vercel)
npm run db:migrate   # apply all supabase/migrations/*.sql (needs DATABASE_URL)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Hướng dẫn lấy từng key (tiếng Việt):** [docs/HUONG-DAN-LAY-KEY.md](docs/HUONG-DAN-LAY-KEY.md)

### Minimum env for local app

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth + database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | Sign-up org creation, share links, admin scripts |
| `DATABASE_URL` | `npm run db:migrate` only (not required on Vercel runtime) |

Optional: `RESEND_API_KEY`, `BASE_RPC_URL`, `BILLING_TREASURY_WALLET`, `OPENAI_API_KEY`, R2 vars — enable email, billing, AI, logos respectively.

### Create admin user + demo data (local / staging)

```bash
# 1. Admin account (Professional plan, super_admin)
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='YourSecurePass1!' npm run seed:admin

# 2. Realistic practice data (8 clients, assessments, emails, attention scenarios)
ADMIN_EMAIL=admin@example.com npm run seed:demo

# Replace demo data
ADMIN_EMAIL=admin@example.com npm run seed:demo -- --reset
```

Demo clients use `internal_ref` prefix `DEMO-*` — safe to reset without touching real data.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Vitest (points engine, prompts, email templates) |
| `npm run setup:env` | Bootstrap `.env.local` |
| `npm run setup:env:sync` | Merge new keys from `.env.example` |
| `npm run db:migrate` | Apply Supabase migrations |
| `npm run db:check` | Verify tables & env checklist |
| `npm run seed:admin` | Seed super_admin + Professional org |
| `npm run seed:demo` | Demo clients, assessments, emails (`ADMIN_EMAIL`, `--reset`) |
| `npm run blog:validate` | Validate blog frontmatter |
| `npm run push:vercel-env` | Push `.env.local` → Vercel Production |
| `npm run go-live` | Launch status + next-step hints |
| `npm run beta:gate-status` | Gate checklist (G1–G9) |
| `npm run beta:smoke` | HTTP smoke tests (`SMOKE_BASE_URL`) |

Full deploy runbook: [docs/DEPLOY.md](docs/DEPLOY.md)

---

## Integrations setup (summary)

### Supabase

1. Create project → enable **Email** auth.
2. `npm run db:migrate` (or run SQL files in `supabase/migrations/` in order).
3. Set URL + keys in `.env.local`.

### Crypto billing (Professional plan)

1. Set treasury wallet (`BILLING_TREASURY_WALLET` + `NEXT_PUBLIC_BILLING_TREASURY_WALLET`).
2. Base RPC (`BASE_RPC_URL`) for on-chain verification at `POST /api/billing/confirm`.
3. WalletConnect project ID for RainbowKit (`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`).
4. Daily cron: `GET /api/cron/expire-billing` (Bearer `CRON_SECRET`).
5. Local testnet guide: [docs/BILLING-CRYPTO-TESTNET.md](docs/BILLING-CRYPTO-TESTNET.md)

### Resend (email)

- Assessment reports, team invites, marketing campaigns, domain verification in Settings.
- Webhook (optional): `POST /api/email/webhooks/resend` with `x-resend-webhook-secret`.

### OpenAI (AI features)

- `OPENAI_API_KEY`, optional `AI_MODEL_DEFAULT` (default `gpt-4o-mini`).
- Toggle per org in **Settings → AI**.

### Cloudflare R2 (logos)

- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`
- Upload in **Settings** (Professional plan).

### Weekly practice digest (cron)

- Set `CRON_SECRET` on Vercel.
- Enable in **Settings → Email** → “Weekly practice digest”.
- Cron route: `GET /api/cron/weekly-practice-digest` (Mondays 08:00 UTC, see `vercel.json`).

---

## Project layout

```
src/
  app/
    (marketing)/     # Public site: home, calculator, blog, pricing
    (app)/app/       # Practice workspace
    (admin)/admin/   # Platform admin
    api/             # billing, Resend, AI, PDF, cron
    share/           # Client-facing shared assessments
  components/        # UI, calculator wizard, CRM, marketing
  lib/
    visa-rules/gsm/  # Schedule 6D calculation engine
    crm/             # Attention items, client status
    ai/              # Explain & draft content
    email/           # Templates, Resend senders
supabase/migrations/
docs/                # Deploy, keys, SEO, launch checklists
```

---

## SEO & content

- Sitemap, `robots.txt`, `public/llms.txt`, JSON-LD on key pages
- Blog guides in `src/lib/blog/` — see [docs/BLOG-SEO.md](docs/BLOG-SEO.md)

---

## UI

- shadcn/ui — `components.json`, `src/components/ui/`
- Add components: `npx shadcn@latest add <name> --overwrite -y`
- Brand: `src/components/brand/Logo.tsx`, DM Sans (headings) + Geist (body)

---

## Operations & launch

| Doc | Purpose |
|-----|---------|
| [docs/DEPLOY.md](docs/DEPLOY.md) | Production deploy, env, webhooks |
| [docs/HUONG-DAN-LAY-KEY.md](docs/HUONG-DAN-LAY-KEY.md) | Key setup (Vietnamese) |
| [docs/LAUNCH-STATUS.md](docs/LAUNCH-STATUS.md) | Current gate status |
| [docs/BETA-QA-SIGNOFF.md](docs/BETA-QA-SIGNOFF.md) | Manual QA checklist |

```bash
npm run test && npm run build
npm run beta:gate-status
SMOKE_BASE_URL=https://your-domain.com npm run beta:smoke
```

---

## Disclaimer

Estimates based on published Schedule 6D rules; policy and invitation rounds change. Migration agents remain responsible for advice given to clients. See `/disclaimer` and `/terms` on the site.
