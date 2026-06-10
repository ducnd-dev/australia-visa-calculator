-- Phase 8E: optional seat limit for enterprise workspaces

alter table public.organizations
  add column if not exists seat_limit integer;

comment on column public.organizations.seat_limit is
  'Max team members (profiles). Null = unlimited. Enforced on invite when set.';
