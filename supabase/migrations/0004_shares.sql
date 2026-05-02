create table if not exists shares (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  batch_id uuid references batches(id) on delete cascade,
  files jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists shares_token_idx on shares(token);

alter table shares enable row level security;
create policy "public read shares" on shares for select using (true);

NOTIFY pgrst, 'reload schema';
