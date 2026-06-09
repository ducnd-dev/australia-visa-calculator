-- Phase 10: transactional email + org email settings

create table if not exists public.organization_email_settings (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  from_name text not null default 'Migration Agency',
  reply_to text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  assessment_id uuid references public.assessments (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  to_email text not null,
  subject text not null,
  template_key text not null,
  resend_id text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_sends_org on public.email_sends (organization_id);
create index if not exists idx_email_sends_assessment on public.email_sends (assessment_id);

alter table public.organization_email_settings enable row level security;
alter table public.email_sends enable row level security;

create policy "org_email_settings_select_member"
  on public.organization_email_settings for select
  using (organization_id = public.user_organization_id());

create policy "org_email_settings_upsert_member"
  on public.organization_email_settings for all
  using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

create policy "email_sends_select_org"
  on public.email_sends for select
  using (organization_id = public.user_organization_id());

create policy "email_sends_insert_org"
  on public.email_sends for insert
  with check (organization_id = public.user_organization_id());
