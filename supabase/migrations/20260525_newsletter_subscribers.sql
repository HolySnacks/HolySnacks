-- ─── newsletter_subscribers ───────────────────────────────────────────────────
-- Email list for the HolySnacks newsletter. Enforces uniqueness so that
-- re-subscribing an existing address is silently ignored by the API.

create table if not exists public.newsletter_subscribers (
  id            uuid        primary key default gen_random_uuid(),
  email         text        not null unique,
  subscribed_at timestamptz not null default now()
);

-- Index for admin / export queries ordered by subscription time
create index if not exists idx_newsletter_subscribers_subscribed_at
  on public.newsletter_subscribers (subscribed_at desc);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.newsletter_subscribers enable row level security;

-- Anyone (including anon) can subscribe — the app calls this from the client
create policy "newsletter_insert_anon"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only the service role (admin) can read the full subscriber list
-- Regular users / anon have no select access
