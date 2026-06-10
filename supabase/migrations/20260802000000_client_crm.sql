-- Client CRM: occupation and archive
alter table public.clients
  add column if not exists anzsco_code text,
  add column if not exists anzsco_title text,
  add column if not exists archived_at timestamptz;

create index if not exists idx_clients_org_active on public.clients (organization_id, updated_at desc)
  where archived_at is null;

create index if not exists idx_clients_anzsco on public.clients (organization_id, anzsco_code)
  where anzsco_code is not null;
