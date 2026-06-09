-- Australia Visa Calculator — Phase 2 schema
create extension if not exists "pgcrypto";

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  plan text not null default 'trial' check (plan in ('trial', 'agency', 'enterprise')),
  stripe_customer_id text,
  logo_path text,
  show_ads boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'agent', 'super_admin')),
  platform_marketing_opt_in boolean not null default false,
  platform_unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  display_name text not null,
  email text,
  internal_ref text,
  notes text,
  marketing_consent_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  visa_subclass text not null check (visa_subclass in ('189', '190', '491')),
  answers jsonb not null,
  breakdown jsonb not null,
  total_points int not null,
  agent_notes text,
  suggestions_json jsonb,
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now()
);

create index idx_profiles_org on public.profiles (organization_id);
create index idx_clients_org on public.clients (organization_id);
create index idx_assessments_client on public.assessments (client_id);
create index idx_assessments_share on public.assessments (share_token);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.assessments enable row level security;

create or replace function public.user_organization_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "organizations_select_member" on public.organizations for select using (id = public.user_organization_id());
create policy "clients_all_org" on public.clients for all using (organization_id = public.user_organization_id()) with check (organization_id = public.user_organization_id());
create policy "assessments_all_org" on public.assessments for all using (organization_id = public.user_organization_id()) with check (organization_id = public.user_organization_id());
