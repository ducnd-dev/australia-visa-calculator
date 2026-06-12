# Beta QA sign-off

Complete with **two browser profiles** (admin + agent). Production URL: **https://australia-visa-calculator.vercel.app**

Date: _______________  
Tester: _______________

Run before first agency onboard. Fix **blocker** bugs only — defer post-launch / Enterprise features.

Full runbook: [DEPLOY.md](./DEPLOY.md) · G8/G9 worksheet: [LAUNCH-G8-G9-WORKSHEET.md](./LAUNCH-G8-G9-WORKSHEET.md)

## Launch gate log (G1–G9)

| Gate | Description | Pass date |
|------|-------------|-----------|
| G1 | `npm run beta:launch` | 2026-06-10 (test+build+db:check; preflight pending G2) |
| G2 | Vercel env vars set | **BLOCKED** — chỉ thiếu `RESEND_API_KEY` (SITE_URL + Supabase đã push Vercel 2026-06-10) |
| G3 | `npm run db:migrate` (prod) | 2026-06-10 (12/12 migrations applied) |
| G4 | `npm run db:check` (prod mirror) | 2026-06-10 |
| G5 | Vercel deploy live | 2026-06-10 — https://australia-visa-calculator.vercel.app |
| G6 | `npm run beta:smoke` on production URL | 2026-06-10 — 9/9 automated checks PASS |
| G7 | `npm run beta:test-email` inbox received | pending G2 (`RESEND_API_KEY`) |
| G8 | Manual smoke (7 steps) | pending G5 |
| G9 | This sign-off (sections 1–7 below) | pending G8 |

## Automated

- [ ] `npm run beta:launch` passes (includes test, build, db:check, preflight)
- [x] `SMOKE_BASE_URL=https://australia-visa-calculator.vercel.app npm run beta:smoke` passes (G6)
- [ ] `BETA_TEST_EMAIL=... npm run beta:test-email` passes (G7)

## 1. Team invite

| Step | Admin | Agent | Pass |
|------|-------|-------|------|
| Admin sends invite from Settings → Team | | | [ ] |
| Email received with `/login?invite=` on production domain | | | [ ] |
| Agent signs up / signs in with invited email | | | [ ] |
| Both see same client list | | | [ ] |
| Agent cannot access billing checkout | | | [ ] |

## 2. CRM

| Step | Pass |
|------|------|
| Create client with ANZSCO occupation | [ ] |
| Search finds client by name or ANZSCO (`?q=`) | [ ] |
| Sort A–Z works | [ ] |
| Archive client — hidden from active list | [ ] |
| Archived client excluded from marketing segment | [ ] |
| Restore client | [ ] |

## 3. Compare assessments

| Step | Pass |
|------|------|
| Two assessments on same client | [ ] |
| Compare picker → `/compare?a=&b=` | [ ] |
| English upgrade shows friendly label + points delta (e.g. +10) | [ ] |
| `created_by` visible on assessment list | [ ] |

## 4. Share links

| Step | Pass |
|------|------|
| Share link opens `/share/[token]` | [ ] |
| Revoke share → link inactive | [ ] |
| Regenerate → new link works | [ ] |
| Agency org: no ads on share page (`show_ads=false`) | [ ] |

## 5. Billing

| Step | Admin | Agent | Pass |
|------|-------|-------|------|
| Billing page loads | | | [ ] |
| Admin sees upgrade / portal buttons | | | [ ] |
| Agent sees read-only message, no checkout | | | [ ] |

## 6. Export

| Step | Pass |
|------|------|
| `/api/clients/export` downloads CSV when signed in | [ ] |
| CSV includes latest_points, latest_subclass columns | [ ] |

## 7. Phase 8 features

| Flow | Pass criteria | Pass |
|------|---------------|------|
| Compare labels | Friendly English labels + points delta on changes | [ ] |
| Branded PDF | Agency plan → Download PDF has logo, breakdown, disclaimer | [ ] |
| Share password | Wrong password blocked; correct password unlocks; revoke clears password | [ ] |
| Resend domain | Check verification updates status; email from custom domain when verified | [ ] |
| State notes | Client ANZSCO 254415 (nurse) → occupation note on client detail | [ ] |
| Seat limit (optional) | `seat_limit` set in Supabase → invite blocked with clear message | [ ] |

## Sign-off

- [ ] All critical paths pass (sections 1–7)
- [ ] Blocker bugs filed: _______________
- [ ] Approved for agency onboard

Notes:

_______________________________________________
