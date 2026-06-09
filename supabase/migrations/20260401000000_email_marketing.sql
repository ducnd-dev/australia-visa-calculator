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
