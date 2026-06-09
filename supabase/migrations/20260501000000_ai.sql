-- Phase 9b: AI explain (logging + org settings)

alter table public.organizations
  add column if not exists ai_enabled boolean not null default true,
  add column if not exists preferred_model text default 'gpt-4o-mini';

create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  task text not null,
  model text not null,
  rules_version text not null,
  prompt_hash text,
  tokens_in int,
  tokens_out int,
  status text not null default 'ok' check (status in ('ok', 'error', 'rate_limited')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_requests_org_month on public.ai_requests (organization_id, created_at);

alter table public.ai_requests enable row level security;

create policy "ai_requests_select_org"
  on public.ai_requests for select
  using (organization_id = public.user_organization_id());

create policy "ai_requests_insert_org"
  on public.ai_requests for insert
  with check (organization_id = public.user_organization_id());
