-- Agency professional profile (MARA, contact, custom disclaimer)
alter table public.organizations
  add column if not exists mara_number text,
  add column if not exists registered_business_name text,
  add column if not exists disclaimer_footer text,
  add column if not exists phone text,
  add column if not exists website text,
  add column if not exists share_link_expiry_days int check (share_link_expiry_days is null or share_link_expiry_days between 1 and 365);

-- Share link lifecycle on assessments
alter table public.assessments
  add column if not exists share_expires_at timestamptz,
  add column if not exists share_revoked_at timestamptz;

create index if not exists idx_assessments_share_revoked on public.assessments (share_revoked_at) where share_revoked_at is not null;
