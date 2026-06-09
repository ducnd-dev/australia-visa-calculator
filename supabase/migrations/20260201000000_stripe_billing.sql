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
