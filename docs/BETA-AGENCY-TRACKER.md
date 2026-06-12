# Beta agency tracker

Target: **3–5 agencies** over 3 weeks. Update after each onboarding session.

**Prerequisite:** Launch gates G1–G9 passed — see [DEPLOY.md](./DEPLOY.md) and gate log in [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md).

**Production URL:** https://australia-visa-calculator.vercel.app (G5/G6 PASS; env+redeploy 2026-06-10 — chờ G2 Resend + G8/G9 QA)

## Summary

| # | Agency | Week | Admin email | Agent invited | Status | Feedback call |
|---|--------|------|-------------|---------------|--------|---------------|
| 1 | | 1 | | [ ] | pending | |
| 2 | | 2 | | [ ] | pending | |
| 3 | | 2 | | [ ] | pending | |
| 4 | | 3 | | [ ] | pending | |
| 5 | | 3 | | [ ] | pending | |

Status: `pending` | `onboarding` | `active` | `churned`

---

## Agency #1 — design partner session script (30 min)

**Prerequisites:** G9 signed in [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md).

**Before session:** `npm run beta:gate-status` — all gates PASS except G8/G9/A1 manual.

| Step | Demo | Notes |
|------|------|-------|
| 1 | Admin signs up or uses pre-created account | |
| 2 | Settings → Team → invite agent email | Verify invite link uses production domain |
| 3 | Agent accepts invite (second browser) | Both see shared clients |
| 4 | Create 3 clients; ≥1 with ANZSCO (e.g. nurse 254415) | State nomination note visible |
| 5 | ≥1 assessment per client | |
| 6 | Enable share password on one assessment; demo in incognito | |
| 7 | Download PDF or print (Agency plan) | Skip if trial-only |
| 8 | Feedback: PDF, compare, CRM search pain points | Record below |

---

## Agency #2 — CRM focus (20 min)

| Step | Demo |
|------|------|
| 1 | Client search `?q=` by name and ANZSCO |
| 2 | Sort A–Z on clients list |
| 3 | Archive client → hidden from active + marketing segment |
| 4 | Restore from archived view |

---

## Agency #3 — Compare focus (20 min)

| Step | Demo |
|------|------|
| 1 | Two assessments on same client |
| 2 | Compare page — friendly English labels + points delta |
| 3 | `created_by` on assessment list |

---

## Agency #4 — Billing + branding (20 min)

| Step | Demo |
|------|------|
| 1 | Admin billing upgrade flow (or explain trial limits) |
| 2 | Branded share link + logo (R2 if configured) |
| 3 | Agent read-only billing |

---

## Agency #5 — Email domain (20 min)

| Step | Demo |
|------|------|
| 1 | Settings → custom `from_domain` → Check verification |
| 2 | Send assessment email report to client |
| 3 | CSV export |

---

## Per-agency checklist

Copy for each agency:

### Agency: _______________

- [ ] Pre-flight: Resend test email to their domain
- [ ] Admin signed up (or account created)
- [ ] ≥3 clients created
- [ ] ≥1 client with ANZSCO
- [ ] ≥1 assessment per client
- [ ] 1 agent invited and accepted
- [ ] Compare flow demonstrated (if 2+ assessments)
- [ ] Phase 8: PDF download demo (Agency plan or trial print)
- [ ] Phase 8: Password-protected share demo (if privacy matters)
- [ ] Feedback call completed (20–30 min)

**Pain points:**

-

**Feature requests (defer post-launch / Enterprise unless blocker):**

-

**Conversion:** trial / upgraded to Agency? _______________

---

## Support quick reference

| Issue | Action |
|-------|--------|
| Email in another workspace | Different email or contact support |
| Invite expired | Settings → Team → revoke + resend |
| Logo upload fails | Check R2 env or skip branding demo |
| Agent needs billing | Admin upgrades or temporary role change |

See [BETA-ONBOARDING.md](./BETA-ONBOARDING.md) for week-by-week focus.
