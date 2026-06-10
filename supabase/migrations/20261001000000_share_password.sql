-- Phase 8C: optional password on client share links

alter table public.assessments
  add column if not exists share_password_hash text;

comment on column public.assessments.share_password_hash is
  'bcrypt hash; when set, share page requires password before showing results.';
