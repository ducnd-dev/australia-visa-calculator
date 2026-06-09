# Australia Visa Points Calculator

B2B-first Schedule 6D points calculator for subclasses **189**, **190**, and **491**.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Deterministic points engine (`src/lib/visa-rules/gsm/`)
- Supabase, Resend, GA4 — optional integrations for Phase 2+

## Development

```bash
npm install
npm run setup:env   # creates .env.local + .env from .env.example (webhook secrets auto-generated)
# Then edit .env.local: add Supabase, Resend, Stripe, OpenAI keys
npm run dev
```

**Hướng dẫn chi tiết lấy từng key (tiếng Việt):** [docs/HUONG-DAN-LAY-KEY.md](docs/HUONG-DAN-LAY-KEY.md)

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run test` — Vitest (points calculation)

## Phase 1 (shipped)

- Public calculator with pathway suggestions
- Shareable `/results?d=...` links
- Marketing home, blog, legal pages
- SEO: sitemap, robots.txt, llms.txt, semantic HTML
- Agency/admin app shells for Phase 2

## Disclaimer

This tool provides estimates only and is not migration advice. Confirm scores via official Department of Home Affairs sources before lodging an EOI.

## Phase 2 — Agency dashboard (Supabase)

1. Create a [Supabase](https://supabase.com) project.
2. Run migration: SQL Editor → paste `supabase/migrations/20260101000000_initial_schema.sql` → Run.
3. Enable Email auth in Authentication → Providers.
4. Copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for sign-up org creation & public share links)
5. Restart `npm run dev`.

### Agency routes

- `/login` — sign up (creates organization + profile) or sign in
- `/app` — dashboard
- `/app/clients` — client list & CRUD
- `/app/assessments/new?clientId=...` — save assessment to DB
- `/share/[token]` — client-facing shared result (noindex)

## Phase 3 — Stripe billing

1. Run migration `supabase/migrations/20260201000000_stripe_billing.sql` in Supabase SQL Editor.
2. [Stripe Dashboard](https://dashboard.stripe.com): create **Agency** product with monthly price → set `STRIPE_PRICE_ID_AGENCY_MONTHLY`.
3. Enable **Customer Portal** (cancel / update payment method).
4. Add to `.env.local`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional for future client-side)
   - `STRIPE_PRICE_ID_AGENCY_MONTHLY`
5. Webhook endpoint (production): `https://your-domain.com/api/stripe/webhook`  
   Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### Local webhook testing

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy whsec_... to STRIPE_WEBHOOK_SECRET in .env.local
```

### File storage (Cloudflare R2)

Agency logos upload to **R2** (S3-compatible). Set in `.env.local`:

- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
- `NEXT_PUBLIC_R2_PUBLIC_URL` — public CDN/custom domain for images
- Optional `R2_KEY_PREFIX` (e.g. `org-logos`)

See `docs/HUONG-DAN-LAY-KEY.md` (R2 section).

### Paid Agency features

- `/app/billing` — upgrade (Checkout) or manage subscription (Portal)
- `/app/settings` — upload logo to R2 (Agency plan)
- `/app/assessments/[id]/print` — print/PDF export
- `/share/[token]` — branded header when org is on Agency plan

New signups stay on **trial** (full CRUD); upgrade when PDF/branding is needed.

## UI (shadcn)

- Initialized with `npx shadcn@latest init` — config in `components.json`
- Components: `src/components/ui/*` (Button, Input, Select, Card, Alert, Checkbox, …)
- Add more: `npx shadcn@latest add <component> --overwrite -y`
- Form helpers: `src/components/forms/simple-field.tsx`, `FlashMessage`, `OptionCard`

## Phase 10 — Email (Resend)

1. Run migration `supabase/migrations/20260301000000_email.sql`.
2. [Resend](https://resend.com): create API key → `RESEND_API_KEY`.
3. Set `EMAIL_FROM_PLATFORM` / `EMAIL_FROM_DEFAULT_AGENCY` (use verified domain in production; `onboarding@resend.dev` for testing).
4. Client detail → **Email report** on each assessment (requires client email).
5. `/app/settings` → configure From name and reply-to.

## Phase 11 — Email marketing

1. Run migration `supabase/migrations/20260401000000_email_marketing.sql`.
2. **Agency:** `/app/marketing` → create campaign → choose segment → send (limits: trial 50/mo, agency 500/mo).
3. **Admin:** set a user `profiles.role = 'super_admin'` in Supabase → `/admin/marketing` for platform newsletters.
4. Webhook (optional): `POST /api/email/webhooks/resend` with header `x-resend-webhook-secret` = `RESEND_WEBHOOK_SECRET`.
5. Clients unsubscribe via link in email → `/unsubscribe/[token]`.

## AI explain (Phase 9b)

1. Run migration `supabase/migrations/20260501000000_ai.sql`.
2. Set `OPENAI_API_KEY` and optional `AI_MODEL_DEFAULT` (default `gpt-4o-mini`).
3. Signed-in agency: **Generate explanation** on assessment results or `/app/assessments/[id]`.
4. Limits: **10** AI calls/month (trial), **500** (Agency plan). Points always from `calculatePoints()` — AI only narrates.

