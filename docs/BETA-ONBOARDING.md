# Beta onboarding — migration agencies

Target: **3–5 agencies** over 3 weeks after technical QA passes.

## Pre-flight (once before first agency)

All stop gates G1–G9 in [DEPLOY.md](./DEPLOY.md) must pass:

- [ ] `npm run beta:launch` (G1)
- [ ] Vercel env configured (G2)
- [ ] `npm run db:migrate` + `npm run db:check` on production DB (G3–G4)
- [ ] Production deploy live (G5)
- [ ] `SMOKE_BASE_URL=https://your-domain.com npm run beta:smoke` (G6)
- [ ] `BETA_TEST_EMAIL=... npm run beta:test-email` (G7)
- [ ] Manual smoke + [BETA-QA-SIGNOFF.md](./BETA-QA-SIGNOFF.md) signed (G8–G9)

## Pre-flight (per agency)

- [ ] Resend test email to agency contact domain
- [ ] Gates G1–G9 still green (re-run `beta:launch` if env changed)
- [ ] Crypto billing + R2 configured if demoing paid branding
- [ ] Admin account created; at least one test client + assessment

Deploy guide: [DEPLOY.md](./DEPLOY.md). Track agencies: [BETA-AGENCY-TRACKER.md](./BETA-AGENCY-TRACKER.md).

## Week-by-week

| Week | Agencies | Focus | Feedback call |
|------|----------|-------|---------------|
| 1 | 1 design partner | Team invite + share password + PDF deliverable | 30 min |
| 2 | 2 more | CRM search, ANZSCO, archive, compare labels | 20 min each |
| 3 | 2 more | Billing upgrade, branded share, Resend domain verify | 20 min each |

## Metrics to track

| Metric | How to measure |
|--------|----------------|
| Invites sent / accepted | `organization_invites` table |
| % clients with ANZSCO | `clients` where `anzsco_code is not null` / total active |
| Compare usage | Analytics or server logs for `/compare` |
| Password-protected shares | `npm run beta:metrics` — password-protected assessment count |
| Verified email domains | `beta:metrics` — orgs with `from_domain_verified` |
| Trial → Agency | `organizations.plan` + USDC prepaid (`crypto_payments`) |
| Time-to-find client | Qualitative in feedback calls |

## Support playbook

| Issue | Response |
|-------|----------|
| Email belongs to another workspace | User must use a different email or contact support |
| Invite expired | Admin revokes and sends new invite from Settings → Team |
| Agent needs billing access | Promote to admin in Supabase `profiles.role` (temporary) or admin upgrades |
| Logo upload fails | Check R2 env vars (see Settings error + README) |

## QA before each onboard

```bash
npm run test && npm run build
npm run beta:metrics   # weekly baseline
```

## Weekly review

1. Run `npm run beta:metrics`
2. Update [BETA-LEARNINGS.md](./BETA-LEARNINGS.md)
3. Update [BETA-AGENCY-TRACKER.md](./BETA-AGENCY-TRACKER.md)
