Build a production-ready SEO web app named **Australia Visa Points Calculator**.

Tech stack:

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* Zustand optional
* No backend required for MVP
* Deploy-ready for Vercel
* use latest version
Main goal:
Create a fast, clean, mobile-first website that helps users estimate their Australian skilled migration points for visas such as Subclass 189, 190, and 491...

Pages:

1. Home page
2. Visa Points Calculator page
3. Results page
4. Blog listing page
5. Blog detail page
6. About page
7. Privacy Policy page
8. Terms page

Core calculator features:

* Age points
* English test points
* Overseas skilled employment points
* Australian skilled employment points
* Educational qualification points
* Australian study requirement points
* Specialist education points
* Credentialled community language points
* Study in regional Australia points
* Partner skills points
* Professional Year in Australia points
* State nomination points for 190 visa
* Regional nomination points for 491 visa

Important:
Use configurable rules in a separate file:
`src/lib/visa-points-rules.ts`

Do not hardcode all logic inside components.

Calculator UX:

* Step-by-step form
* Progress indicator
* Clear explanation for each question
* Real-time points preview
* Final score summary
* Breakdown by category
* CTA based on score:

  * Below 65: “You may need to improve your points”
  * 65–79: “You may be eligible, but competition can be high”
  * 80+: “Strong estimated score”
* Disclaimer: “This tool provides an estimate only and is not migration advice.”

SEO requirements:

* Generate metadata for every page
* Use semantic HTML
* Include FAQ section with schema.org FAQPage JSON-LD
* Add sitemap.ts
* Add robots.ts
* Optimize for keywords:

  * Australia visa points calculator
  * 189 visa points calculator
  * 190 visa points calculator
  * 491 visa points calculator
  * skilled migration points calculator Australia
  * Australia PR points calculator

Home page sections:

* Hero section with title: “Australia Visa Points Calculator”
* Short description
* CTA button to calculator
* Explanation: “How Australia PR points are calculated”
* Visa type cards: 189, 190, 491
* Benefits section
* FAQ section
* Blog preview section

Design:

* Clean SaaS style
* White background
* Soft cards
* Blue primary color
* Mobile-first responsive
* Professional and trustworthy
* Avoid childish design

Ad-ready layout:

* Add reusable components:

  * `AdBanner`
  * `AdSlot`
* Place ad slots:

  * Below hero
  * Inside calculator sidebar on desktop
  * Below results summary
  * Between blog content sections
* For now, use placeholder boxes saying “Advertisement”.
* Make it easy to replace later with Google AdSense.

Project structure:

* `src/app/page.tsx`
* `src/app/calculator/page.tsx`
* `src/app/results/page.tsx`
* `src/app/blog/page.tsx`
* `src/app/blog/[slug]/page.tsx`
* `src/app/about/page.tsx`
* `src/app/privacy/page.tsx`
* `src/app/terms/page.tsx`
* `src/components/calculator/`
* `src/components/layout/`
* `src/components/ads/`
* `src/lib/visa-points-rules.ts`
* `src/lib/calculate-points.ts`
* `src/lib/blog-data.ts`
* `src/lib/seo.ts`

Add sample blog posts:

1. “How many points do you need for Australian PR?”
2. “189 vs 190 vs 491 visa: What is the difference?”
3. “How to increase your Australia PR points”
4. “PTE vs IELTS for Australian migration”

Code quality:

* Use TypeScript types properly
* Use reusable components
* Keep calculator logic testable
* Add basic unit tests for point calculation if possible
* Ensure the app runs with `npm run dev`
* No fake external API calls
* No authentication
* No payment
* No database for MVP

Final output:
Generate the full project files and make sure there are no TypeScript errors.

---

## Implementation status (Phase 1 — executed)

### Shipped
- Next.js 16 App Router, TypeScript, Tailwind, Zod points engine
- Pages: Home (B2B), `/calculator` (multi-step + results step), `/results?d=` share, blog (4 posts), about, privacy, terms, login stub
- Schedule 6D: employment cap 20, nomination 190/491, partner branches, pathway **suggest-improvements**
- SEO: semantic HTML, `sitemap.ts`, `robots.ts` (incl. AI bots), `llms.txt`, FAQ JSON-LD
- Stubs: Supabase client, Resend, GA4, AdSense placeholders
- Route shells: `/app` (agency Phase 2), `/admin` (Phase 2)
- Vitest: `npm run test`

### Phase 2+ (planned)
- Supabase Auth, clients, assessments CRUD
- USDC prepaid Professional tier, PDF, branded share
- Resend email marketing (agency + admin)
- AI multi-model (explain only — no point calculation)

### Env
See `.env.example`

### Phase 2 (executed)
- Supabase Auth (email/password), organizations, profiles, clients, assessments
- Agency dashboard `/app`, middleware protection
- Save assessments + share links `/share/[token]`

### Phase 3 (executed)
- USDC on Base prepaid billing; on-chain confirm + cron expiry updates `organizations.plan`
- Trial vs Agency: PDF print route, branded share, org logo (Cloudflare R2)
- `/app/billing`, `/app/settings`, idempotent webhook events table

### Phase 10 (executed)
- Resend: send assessment report from client detail (`Email report`)
- `organization_email_settings`, `email_sends` log table
- Email sender settings on `/app/settings`
- Default email settings on agency signup; optional email on save assessment
- Client detail: email send log

### Phase 9b — AI explain (executed)
- OpenAI explain breakdown; points from engine only (never recalculated by AI)
- `POST /api/ai/explain-assessment`; agency wizard + `/app/assessments/[id]`
- Limits: trial 10/mo, agency 500/mo; `ai_requests` log

### Static pages (executed)
- Full content: About, Privacy, Terms, Disclaimer, FAQ, Pricing, Contact, Sources, For agents
- Footer nav + sitemap + robots updated

### Blog SEO (executed)
- 8 guides in `src/lib/blog/posts/` with structured sections, FAQ, JSON-LD, TOC
- `npm run blog:validate` — see [docs/BLOG-SEO.md](docs/BLOG-SEO.md)

### Phase 11 (executed)
- Agency campaigns `/app/marketing` (segments, send now, plan limits)
- Platform admin `/admin/marketing` (super_admin, agent newsletter)
- `/unsubscribe/[token]`, Resend webhook → `email_events`
- Templates table + marketing consent on signup
