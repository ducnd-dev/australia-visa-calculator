# Launch status (auto-updated by operator)

Last check: 2026-06-10 (env pushed + redeploy)

## Automatable gates

| Gate | Status | Command / action |
|------|--------|------------------|
| G1 | Partial | `npm run beta:launch` — fails preflight until G2 |
| G2 | **BLOCKED** | `RESEND_API_KEY=re_xxx LAUNCH_SITE_URL=https://australia-visa-calculator.vercel.app npm run setup:launch-g2` |
| G3–G4 | PASS | `npm run db:migrate` + `npm run db:check` |
| G5 | **PASS** | Live: https://australia-visa-calculator.vercel.app |
| G6 prod | **PASS** | `npm run beta:smoke` — 9/9 on production URL |
| G6 local | PASS | Dev smoke on localhost (pre-deploy sanity) |
| G7 | Pending | `BETA_TEST_EMAIL=... npm run beta:test-email` after G2 |
| G8–G9 | Pending | [LAUNCH-G8-G9-WORKSHEET.md](./LAUNCH-G8-G9-WORKSHEET.md) |
| Agency #1 | Pending | After G9 — [BETA-AGENCY-TRACKER.md](./BETA-AGENCY-TRACKER.md) |

## One command when keys are ready

```bash
RESEND_API_KEY=re_xxx \
LAUNCH_SITE_URL=https://your-app.vercel.app \
BETA_TEST_EMAIL=your@email.com \
npm run setup:launch-g2

# Sync env + redeploy (Vercel linked as ducnd-dev):
npm run push:vercel-env    # after RESEND in .env.local
npx vercel deploy --prod
npm run beta:complete-gates
```

## Quick check

```bash
npm run go-live             # orchestrator + next step
npm run beta:gate-status
npm run print:vercel-env    # mirror .env.local → Vercel Production
npm run beta:weekly -- --week=1
```

## 4-week schedule

See [WEEK-BY-WEEK-LAUNCH.md](./WEEK-BY-WEEK-LAUNCH.md).
