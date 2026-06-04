-- ─── user_achievements ────────────────────────────────────────────────────────
-- Tracks milestone badges unlocked by users. Each row represents a single
-- achievement unlock event; the achievement_key is unique per user so the
-- same badge cannot be awarded twice.

create table if not exists public.user_achievements (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  achievement_key text        not null,
  unlocked_at     timestamptz not null default now(),
  unique (user_id, achievement_key)
);

-- Index for per-user badge lookups
create index if not exists idx_user_achievements_user_id
  on public.user_achievements (user_id);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.user_achievements enable row level security;

-- Users can read their own achievements; anon can read all for public profiles
create policy "achievements_select_public"
  on public.user_achievements for select
  using (true);

-- Only authenticated users can unlock achievements for themselves
create policy "achievements_insert_own"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);


-- ─── push_subscriptions ───────────────────────────────────────────────────────
-- Stores Web Push API subscription objects for PWA push notifications.
-- Each device/browser registers a unique endpoint; a user may have multiple
-- subscriptions across devices.

create table if not exists public.push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references public.profiles(id) on delete cascade,
  endpoint    text        not null unique,
  p256dh_key  text        not null,  -- ECDH public key for payload encryption
  auth_key    text        not null,  -- authentication secret
  created_at  timestamptz not null default now()
);

-- Index for per-user subscription lookups (send to all devices)
create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions (user_id);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.push_subscriptions enable row level security;

-- Users can manage their own push subscriptions
create policy "push_subscriptions_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id or user_id is null);

create policy "push_subscriptions_insert_anon"
  on public.push_subscriptions for insert
  with check (true);

create policy "push_subscriptions_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id or user_id is null);
