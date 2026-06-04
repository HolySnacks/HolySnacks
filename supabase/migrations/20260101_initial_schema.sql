-- ─── profiles ─────────────────────────────────────────────────────────────────
-- One row per authenticated user. Created on first sign-in (or lazily on first
-- scan). Mirrors the auth.users row; user_id is the Supabase auth UID.
-- Used for leaderboard queries, XP/level progression, and streak tracking.

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  xp            integer       not null default 0,
  level         integer       not null default 1,
  streak_days   integer       not null default 0,
  last_scan_at  date,                            -- date of most recent scan ("YYYY-MM-DD")
  total_scans   integer       not null default 0,
  created_at    timestamptz   not null default now()
);

-- Index for leaderboard (ordered by XP descending)
create index if not exists idx_profiles_xp
  on public.profiles (xp desc);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Anyone (including anon) can read profiles — needed for leaderboard
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- Only the owning user can insert their own profile row
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Only the owning user can update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);


-- ─── scan_records ─────────────────────────────────────────────────────────────
-- Audit log of every product scan a user performs. Each row captures the
-- product scored, the purity score, the NutriScore grade, and XP awarded.
-- Used to populate the "Recent Scans" history panel and to drive XP updates.

create table if not exists public.scan_records (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  product_name  text        not null,
  brand         text,
  score         integer     not null,            -- 0–1000 purity score
  grade         text,                            -- letter grade label, e.g. "A", "B+"
  xp_earned     integer     not null default 0,
  created_at    timestamptz not null default now()
);

-- Index for per-user history lookups (most-recent-first)
create index if not exists idx_scan_records_user_id_created
  on public.scan_records (user_id, created_at desc);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.scan_records enable row level security;

-- Users can only read their own scan history
create policy "scan_records_select_own"
  on public.scan_records for select
  using (auth.uid() = user_id);

-- Only authenticated users can insert their own scan records
create policy "scan_records_insert_own"
  on public.scan_records for insert
  with check (auth.uid() = user_id);
