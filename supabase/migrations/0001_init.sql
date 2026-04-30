-- SetSmart Ads Lab — initial schema
-- Run this in Supabase SQL Editor (one-shot, idempotent)

create extension if not exists "pgcrypto";

-- 1. batches: one row per daily generation run
create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  summary text,
  created_at timestamptz not null default now()
);

-- 2. ads: 10 ads per batch, each with FR + EN versions
create table if not exists ads (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  slug text not null,
  concept text not null,
  hook_fr text,
  hook_en text,
  brief text,
  html_fr text,
  html_en text,
  png_url_fr text,
  png_url_en text,
  position int,
  created_at timestamptz not null default now(),
  unique (batch_id, slug)
);
create index if not exists ads_batch_id_idx on ads(batch_id);

-- 3. feedback: Veek rates each ad
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references ads(id) on delete cascade,
  rating int check (rating between 1 and 5),
  verdict text check (verdict in ('keep', 'pivot', 'kill')),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists feedback_ad_id_idx on feedback(ad_id);

-- 4. learnings: patterns extracted from feedback over time, used to improve next batches
create table if not exists learnings (
  id uuid primary key default gen_random_uuid(),
  pattern text not null,
  category text,
  frequency int not null default 1,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 5. RLS: lock down by default; service role bypasses
alter table batches enable row level security;
alter table ads enable row level security;
alter table feedback enable row level security;
alter table learnings enable row level security;

-- Public read on batches/ads (so the dashboard can render without auth for now)
create policy "public read batches" on batches for select using (true);
create policy "public read ads" on ads for select using (true);
-- Feedback: public read + public insert (we'll lock this down later if you add auth)
create policy "public read feedback" on feedback for select using (true);
create policy "public insert feedback" on feedback for insert with check (true);
-- Learnings: public read only
create policy "public read learnings" on learnings for select using (true);

-- 6. Storage bucket for rendered PNGs
insert into storage.buckets (id, name, public)
values ('ads-lab-images', 'ads-lab-images', true)
on conflict (id) do nothing;

create policy "public read ads-lab-images" on storage.objects
  for select using (bucket_id = 'ads-lab-images');
