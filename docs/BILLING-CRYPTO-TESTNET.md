# Crypto billing — Base Sepolia E2E test

Manual checklist before enabling Base mainnet billing.

## 1. Env (`.env.local`)

```env
NEXT_PUBLIC_BASE_CHAIN_ID=84532
BASE_CHAIN_ID=84532
BASE_RPC_URL=https://sepolia.base.org

# Your test treasury (any wallet you control)
BILLING_TREASURY_WALLET=0xYourTreasuryAddress
NEXT_PUBLIC_BILLING_TREASURY_WALLET=0xYourTreasuryAddress

BILLING_USDC_AMOUNT=1
NEXT_PUBLIC_BILLING_USDC_AMOUNT=1
BILLING_PERIOD_DAYS=30
NEXT_PUBLIC_BILLING_PERIOD_DAYS=30

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_cloud_project_id
CRON_SECRET=local-dev-cron-secret
```

USDC on Base Sepolia defaults to Circle test token `0x036CbD53842c5426634e7929541eC2318f3dCF7e`.

## 2. Get test USDC

1. Add **Base Sepolia** to MetaMask (chain id `84532`).
2. Get Sepolia ETH for gas from a Base Sepolia faucet.
3. Mint test USDC from [Circle faucet](https://faucet.circle.com/) (select Base Sepolia).

## 3. Apply migration

```bash
npm run db:migrate
```

Ensures `billing_expires_at`, `billing_wallet`, and `crypto_payments` exist.

## 4. Pay in app

1. `npm run dev` → sign in as workspace **admin**.
2. Open `/app/billing`.
3. Connect wallet → **Pay 1 USDC — 30 days on Base**.
4. Confirm transaction in wallet.
5. Expect success banner and `plan=agency` (PDF export unlocked).

## 5. Verify server

- `crypto_payments` row with your `tx_hash`.
- `organizations.billing_expires_at` ~30 days ahead.
- `organizations.plan` = `agency`.

## 6. Expiry cron (optional)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/expire-billing
```

After manually setting `billing_expires_at` in the past, cron should downgrade to `trial`.

## 7. Production (mainnet)

Switch env to chain `8453`, mainnet RPC, real treasury multisig, and production USDC amount (e.g. `32`).
