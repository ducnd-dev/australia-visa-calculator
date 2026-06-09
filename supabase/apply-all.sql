-- Auto-generated: npm run db:build-apply-all
-- Paste in Supabase → SQL Editor → Run (once)

-- >>> 20260101000000_initial_schema.sql
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

-- >>> 20260201000000_stripe_billing.sql
-- Phase 3: Stripe billing fields + webhook idempotency + org logos storage

alter table public.organizations
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_subscription_status text,
  add column if not exists billing_email text;

create table if not exists public.stripe_webhook_events (
  id text primary key,
  processed_at timestamptz not null default now()
);

-- Billing plan fields: updated only via service role (webhook bypasses RLS).
-- logo_path: updated via server action (admin client) after Storage upload.

-- Storage: org logos (public read for branded share links)
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

create policy "org_logos_public_read"
  on storage.objects for select
  using (bucket_id = 'org-logos');

create policy "org_logos_upload_member"
  on storage.objects for insert
  with check (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] = public.user_organization_id()::text
  );

create policy "org_logos_update_member"
  on storage.objects for update
  using (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] = public.user_organization_id()::text
  );

create policy "org_logos_delete_member"
  on storage.objects for delete
  using (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] = public.user_organization_id()::text
  );

-- >>> 20260301000000_email.sql
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

-- >>> 20260401000000_email_marketing.sql
-- Phase 11: email marketing (campaigns, templates, events, unsubscribe)

alter table public.email_sends
  add column if not exists campaign_id uuid,
  add column if not exists send_type text not null default 'transactional'
    check (send_type in ('transactional', 'marketing'));

alter table public.email_sends
  alter column organization_id drop not null;

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('platform', 'organization')),
  organization_id uuid references public.organizations (id) on delete cascade,
  slug text not null,
  name text not null,
  subject text not null,
  template_key text not null,
  body_html text not null,
  created_at timestamptz not null default now(),
  unique (scope, organization_id, slug)
);

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('platform', 'organization')),
  organization_id uuid references public.organizations (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  name text not null,
  template_key text not null,
  subject text not null,
  body_html text not null,
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'cancelled')),
  segment_filter jsonb not null default '{"type":"consented_clients"}'::jsonb,
  sent_at timestamptz,
  recipient_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.email_sends
  add constraint email_sends_campaign_id_fkey
  foreign key (campaign_id) references public.email_campaigns (id) on delete set null;

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  send_id uuid not null references public.email_sends (id) on delete cascade,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.unsubscribe_tokens (
  token text primary key,
  client_id uuid references public.clients (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (client_id is not null or profile_id is not null)
);

create index if not exists idx_email_campaigns_org on public.email_campaigns (organization_id);
create index if not exists idx_email_campaigns_scope on public.email_campaigns (scope);
create index if not exists idx_email_sends_campaign on public.email_sends (campaign_id);
create index if not exists idx_email_sends_type_created on public.email_sends (organization_id, send_type, created_at);

alter table public.email_templates enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_events enable row level security;
alter table public.unsubscribe_tokens enable row level security;

-- Templates: org members read org-scoped; platform templates readable by all authenticated
create policy "email_templates_select"
  on public.email_templates for select
  using (
    scope = 'platform'
    or organization_id = public.user_organization_id()
  );

create policy "email_templates_org_write"
  on public.email_templates for all
  using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

create policy "email_campaigns_org"
  on public.email_campaigns for all
  using (
    (scope = 'organization' and organization_id = public.user_organization_id())
    or (scope = 'platform' and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    ))
  )
  with check (
    (scope = 'organization' and organization_id = public.user_organization_id())
    or (scope = 'platform' and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    ))
  );

create policy "email_events_select_org"
  on public.email_events for select
  using (
    exists (
      select 1 from public.email_sends s
      where s.id = send_id
        and (
          s.organization_id = public.user_organization_id()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'super_admin'
          )
        )
    )
  );

-- Unsubscribe tokens: public read by token for unsubscribe page (via service role only in app)
create policy "unsubscribe_tokens_no_direct"
  on public.unsubscribe_tokens for select
  using (false);

-- Seed platform + default org template bodies (slug → template_key)
insert into public.email_templates (scope, organization_id, slug, name, subject, template_key, body_html)
values
  (
    'organization', null, 'client-follow-up', 'Client follow-up',
    'Following up on your migration points assessment',
    'client-follow-up',
    '<p>Hi {{clientName}},</p><p>{{agencyName}} is following up regarding your skilled migration points estimate.</p><p>If you have questions, reply to this email.</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p><p style="font-size:12px;color:#64748b">{{disclaimer}}</p>'
  ),
  (
    'platform', null, 'platform-newsletter', 'Platform newsletter',
    'Updates from Visa Calculator',
    'platform-newsletter',
    '<p>Hi {{agentName}},</p><p>{{body}}</p><p><a href="{{unsubscribeUrl}}">Unsubscribe from product emails</a></p>'
  )
on conflict (scope, organization_id, slug) do nothing;

-- >>> 20260501000000_ai.sql
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

-- >>> 20260601000000_data_api_grants.sql
-- Ensure public tables are reachable via Supabase Data API (publishable / anon keys).
-- RLS policies still restrict rows.

grant usage on schema public to postgres, anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;

alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;

