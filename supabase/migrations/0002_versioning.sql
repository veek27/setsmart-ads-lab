-- Add status + versioning to ads, plus ad_versions table for history
alter table ads add column if not exists status text not null default 'pending'
  check (status in ('pending','validated','declined'));

alter table ads add column if not exists version int not null default 1;

create table if not exists ad_versions (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references ads(id) on delete cascade,
  version int not null,
  hook_fr text,
  hook_en text,
  brief text,
  correction_notes text,
  created_at timestamptz not null default now()
);
create index if not exists ad_versions_ad_id_idx on ad_versions(ad_id);

alter table ad_versions enable row level security;
create policy "public read ad_versions" on ad_versions for select using (true);

NOTIFY pgrst, 'reload schema';
