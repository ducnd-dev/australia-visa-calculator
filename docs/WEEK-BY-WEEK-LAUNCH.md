# Week-by-week launch + beta onboard

4-week operator schedule. Tools: `npm run beta:gate-status`, `npm run beta:weekly -- --week=N`.

## Week 1 — G2–G9 (production)

| Day | Action | Gate |
|-----|--------|------|
| 1 | `RESEND_API_KEY=... LAUNCH_SITE_URL=... npm run setup:launch-g2` | G2 |
| 1 | `npm run print:vercel-env` → paste Vercel Production | G2 |
| 1–2 | `npx vercel login` → `npx vercel deploy --prod` | G5 |
| 2 | `npm run beta:complete-gates` | G6–G7 |
| 3–4 | [LAUNCH-G8-G9-WORKSHEET.md](./LAUNCH-G8-G9-WORKSHEET.md) + [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md) | G8–G9 |

**Exit:** All gates G1–G9 ticked in QA sign-off gate log.

## Week 2 — Agency #1

- Session script: [BETA-AGENCY-TRACKER.md](./BETA-AGENCY-TRACKER.md) § Agency #1
- After: `npm run beta:weekly -- --week=2`
- Tracker row #1 → `active`

## Week 3 — Agencies #2–#3

| Agency | Demo |
|--------|------|
| #2 | CRM search, ANZSCO, archive |
| #3 | Compare labels + points delta |

- `npm run beta:weekly -- --week=3`

## Week 4 — Agencies #4–#5 + retro

| Agency | Demo |
|--------|------|
| #4 | Billing upgrade, branded share |
| #5 | Resend domain verify in Settings |

- `npm run beta:weekly -- --week=4`
- Fill Week 4 retrospective in [BETA-LEARNINGS.md](./BETA-LEARNINGS.md)
- Decide Phase 10 (Enterprise / GA4) only if ≥2 agencies request
