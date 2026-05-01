-- Store OAuth refresh tokens (single-tenant: one row per provider)
create table if not exists oauth_tokens (
  provider text primary key,
  refresh_token text not null,
  scope text,
  updated_at timestamptz not null default now()
);

alter table oauth_tokens enable row level security;
-- No public policies — service role only

NOTIFY pgrst, 'reload schema';
