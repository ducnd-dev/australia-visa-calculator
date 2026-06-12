-- Crypto billing (USDC on Base): prepaid Professional plan

-- Migrate active Stripe subscribers before dropping Stripe columns
update public.organizations
set billing_expires_at = now() + interval '30 days'
where stripe_subscription_status in ('active', 'trialing')
  and billing_expires_at is null;

alter table public.organizations
  add column if not exists billing_expires_at timestamptz,
  add column if not exists billing_wallet text;

create table if not exists public.crypto_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  tx_hash text not null unique,
  chain_id int not null,
  token_address text not null,
  amount_units bigint not null,
  payer_wallet text not null,
  period_days int not null default 30,
  confirmed_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index if not exists idx_crypto_payments_org on public.crypto_payments (organization_id);
create index if not exists idx_organizations_billing_expires on public.organizations (billing_expires_at)
  where billing_expires_at is not null;

alter table public.crypto_payments enable row level security;

-- Members can read their org payment history (insert via service role only)
create policy "crypto_payments_select_org"
  on public.crypto_payments for select
  using (organization_id = public.user_organization_id());

drop table if exists public.stripe_webhook_events;

alter table public.organizations
  drop column if exists stripe_customer_id,
  drop column if exists stripe_subscription_id,
  drop column if exists stripe_subscription_status;
