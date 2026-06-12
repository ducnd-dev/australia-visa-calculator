# G8–G9 manual worksheet (production)

Use after G5 deploy. Production URL: **https://australia-visa-calculator.vercel.app**

Tester: _______________  Date: _______________

## G8 — Manual smoke (admin, production)

| # | Step | Pass | Notes |
|---|------|------|-------|
| 1 | Sign up new agency → `/app` dashboard | [ ] | |
| 2 | Client + ANZSCO → assessment → share link opens | [ ] | |
| 3 | Download PDF (`/api/assessments/[id]/pdf`) | [ ] | Skip if trial-only |
| 4 | Share password → incognito → unlock | [ ] | |
| 5 | Team invite → link uses production domain | [ ] | Not localhost |
| 6 | Settings → Resend domain check (if custom domain) | [ ] | |
| 7 | `/api/clients/export` CSV when signed in | [ ] | |

## G9 — QA sign-off (admin + agent browsers)

Copy results to [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md).

| Section | Pass |
|---------|------|
| 1 Team invite | [ ] |
| 2 CRM | [ ] |
| 3 Compare | [ ] |
| 4 Share links | [ ] |
| 5 Billing | [ ] |
| 6 Export | [ ] |
| 7 Phase 8 features | [ ] |

**Approved for agency onboard:** [ ]

Blocker bugs (if any): _______________
