-- Team invites and org member visibility
create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null default 'agent' check (role in ('admin', 'agent')),
  invited_by uuid references public.profiles (id) on delete set null,
  token text unique not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create index if not exists idx_org_invites_token on public.organization_invites (token);
create index if not exists idx_org_invites_org on public.organization_invites (organization_id);

alter table public.organization_invites enable row level security;

-- Org members can read profiles in same workspace
drop policy if exists "profiles_select_org" on public.profiles;
create policy "profiles_select_org" on public.profiles
  for select using (organization_id = public.user_organization_id());

-- Admins manage invites for their org
create policy "invites_select_admin" on public.organization_invites
  for select using (
    organization_id = public.user_organization_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "invites_insert_admin" on public.organization_invites
  for insert with check (
    organization_id = public.user_organization_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "invites_update_admin" on public.organization_invites
  for update using (
    organization_id = public.user_organization_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "invites_delete_admin" on public.organization_invites
  for delete using (
    organization_id = public.user_organization_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
