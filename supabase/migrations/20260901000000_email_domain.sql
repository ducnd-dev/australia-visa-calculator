-- Phase 7: optional custom Resend sending domain per org

alter table public.organization_email_settings
  add column if not exists from_domain text,
  add column if not exists from_domain_verified boolean not null default false;

comment on column public.organization_email_settings.from_domain is
  'Custom domain for From address (e.g. agency.com.au). Requires DNS verification in Resend.';
comment on column public.organization_email_settings.from_domain_verified is
  'Set true after domain verified in Resend dashboard.';
