-- Product polish: onboarding, client status, attention RPC, email templates, digest flag

create table if not exists public.organization_onboarding (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.organization_onboarding enable row level security;

create policy "organization_onboarding_org"
  on public.organization_onboarding for all
  using (organization_id = public.user_organization_id())
  with check (organization_id = public.user_organization_id());

alter table public.clients
  add column if not exists status text not null default 'active'
    check (status in ('lead', 'active', 'lodged', 'archived')),
  add column if not exists is_example boolean not null default false;

update public.clients
set status = 'archived'
where archived_at is not null and status = 'active';

create index if not exists idx_clients_org_status on public.clients (organization_id, status)
  where archived_at is null;

alter table public.organization_email_settings
  add column if not exists weekly_digest_enabled boolean not null default false;

insert into public.email_templates (scope, organization_id, slug, name, subject, template_key, body_html)
values
  (
    'organization', null, 'english-follow-up', 'English improvement follow-up',
    'Improving your English score for skilled migration',
    'english-follow-up',
    '<p>Hi {{clientName}},</p><p>Following our points assessment, improving your English test result may increase your Schedule 6D score.</p><p>Reply to this email if you would like to discuss next steps.</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p><p style="font-size:12px;color:#64748b">{{disclaimer}}</p>'
  ),
  (
    'organization', null, 'check-in-reminder', 'Six-month check-in',
    'Time to review your migration points estimate',
    'check-in-reminder',
    '<p>Hi {{clientName}},</p><p>It has been a while since we last reviewed your skilled migration points estimate. Circumstances and policy can change — we recommend a fresh assessment.</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p><p style="font-size:12px;color:#64748b">{{disclaimer}}</p>'
  )
on conflict (scope, organization_id, slug) do nothing;

create or replace function public.get_attention_items(p_org_id uuid, p_limit int default 8)
returns table (
  item_type text,
  priority text,
  client_id uuid,
  client_name text,
  assessment_id uuid,
  message text,
  sort_key int
)
language sql
stable
security definer
set search_path = public
as $$
  with active_clients as (
    select c.id, c.display_name, c.email, c.anzsco_code, c.status
    from clients c
    where c.organization_id = p_org_id
      and c.archived_at is null
      and c.status != 'archived'
      and c.is_example = false
  ),
  latest_assessment as (
    select distinct on (a.client_id)
      a.client_id,
      a.id as assessment_id,
      a.total_points,
      a.created_at,
      a.share_token,
      a.share_revoked_at,
      a.share_expires_at
    from assessments a
    where a.organization_id = p_org_id
    order by a.client_id, a.created_at desc
  )
  select * from (
    select
      'no_assessment'::text,
      'high'::text,
      c.id,
      c.display_name,
      null::uuid,
      'No assessment on file'::text,
      1
    from active_clients c
    where not exists (select 1 from assessments a where a.client_id = c.id)

    union all

    select
      'stale_assessment',
      'medium',
      c.id,
      c.display_name,
      la.assessment_id,
      'Assessment is over 6 months old — consider re-running',
      2
    from active_clients c
    join latest_assessment la on la.client_id = c.id
    where la.created_at < now() - interval '180 days'

    union all

    select
      'low_points',
      'high',
      c.id,
      c.display_name,
      la.assessment_id,
      'Latest score below 65 points',
      3
    from active_clients c
    join latest_assessment la on la.client_id = c.id
    where la.total_points < 65

    union all

    select
      'failed_email',
      'high',
      es.client_id,
      c.display_name,
      es.assessment_id,
      'Email delivery failed: ' || left(es.subject, 60),
      4
    from email_sends es
    join active_clients c on c.id = es.client_id
    where es.organization_id = p_org_id
      and es.status = 'failed'
      and es.created_at > now() - interval '7 days'

    union all

    select
      'share_expiring',
      'medium',
      c.id,
      c.display_name,
      la.assessment_id,
      'Share link expires within 7 days',
      5
    from active_clients c
    join latest_assessment la on la.client_id = c.id
    where la.share_token is not null
      and la.share_revoked_at is null
      and la.share_expires_at is not null
      and la.share_expires_at > now()
      and la.share_expires_at < now() + interval '7 days'

    union all

    select
      'missing_email',
      'low',
      c.id,
      c.display_name,
      la.assessment_id,
      'Client has assessments but no email address',
      6
    from active_clients c
    join latest_assessment la on la.client_id = c.id
    where c.email is null

    union all

    select
      'no_anzsco',
      'low',
      c.id,
      c.display_name,
      null::uuid,
      'Occupation (ANZSCO) not set',
      7
    from active_clients c
    where c.anzsco_code is null
  ) items(item_type, priority, client_id, client_name, assessment_id, message, sort_key)
  order by items.sort_key, items.client_name
  limit p_limit;
$$;

grant execute on function public.get_attention_items(uuid, int) to authenticated;
grant execute on function public.get_attention_items(uuid, int) to service_role;
