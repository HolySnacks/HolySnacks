-- ─── products_cache ───────────────────────────────────────────────────────────
-- Cached product data fetched from Open Food Facts (or submitted by users).
-- Keyed on a normalised, lower-cased search string so the scan API can skip
-- the external HTTP round-trip on repeated lookups.
-- Written by both /api/scan (fire-and-forget) and /api/missed (upsert).

create table if not exists public.products_cache (
  id            uuid        primary key default gen_random_uuid(),
  search_key    text        not null unique,      -- lower-cased query / barcode
  product_name  text        not null,
  brand         text        not null default '',
  ingredients   text        not null,
  nutriscore    text,                             -- single letter: a–e, or null
  image_url     text,
  source        text,                             -- e.g. "openfoodfacts_auto", "user_submission"
  created_at    timestamptz not null default now()
);

-- Primary lookup index (exact match on normalised key)
create index if not exists idx_products_cache_search_key
  on public.products_cache (search_key);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.products_cache enable row level security;

-- Anyone (including anon) can read the cache — powers the public scan endpoint
create policy "products_cache_select_public"
  on public.products_cache for select
  using (true);

-- Only the service role / anon key may insert or upsert cache rows
-- (the scan and missed APIs run with the anon key via REST)
create policy "products_cache_insert_anon"
  on public.products_cache for insert
  with check (true);

create policy "products_cache_update_anon"
  on public.products_cache for update
  using (true);


-- ─── missed_searches ──────────────────────────────────────────────────────────
-- Tracks product queries that returned no result from Open Food Facts.
-- Aggregates how many users searched for the same term and records the
-- auto-research status so the app can surface "still looking…" feedback.

create table if not exists public.missed_searches (
  id                uuid        primary key default gen_random_uuid(),
  query             text        not null unique,  -- normalised lower-case search term
  search_count      integer     not null default 1,
  user_ids          uuid[],                       -- de-duped list of user UUIDs who searched
  research_status   text        not null default 'pending',
                                                  -- 'pending' | 'researching' | 'found' | 'not_found'
  status            text,                         -- submission workflow override: 'submitted'
  last_searched_at  timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

-- Index for fast exact-match lookups by normalised query
create index if not exists idx_missed_searches_query
  on public.missed_searches (query);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.missed_searches enable row level security;

-- Anyone can read missed-search records (used for count/status feedback in UI)
create policy "missed_searches_select_public"
  on public.missed_searches for select
  using (true);

-- Unauthenticated and authenticated users can record missed searches
create policy "missed_searches_insert_anon"
  on public.missed_searches for insert
  with check (true);

create policy "missed_searches_update_anon"
  on public.missed_searches for update
  using (true);


-- ─── user_submissions ─────────────────────────────────────────────────────────
-- Manual ingredient submissions from users for products not found in
-- Open Food Facts. Submitted via /api/submit and reviewed before being
-- promoted into products_cache.

create table if not exists public.user_submissions (
  id               uuid        primary key default gen_random_uuid(),
  query            text        not null,          -- original search query the user typed
  brand            text,
  ingredients_text text        not null,
  submitted_by     uuid        references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- Index for admin review queries ordered by submission time
create index if not exists idx_user_submissions_created_at
  on public.user_submissions (created_at desc);

-- Index for per-user submission history
create index if not exists idx_user_submissions_submitted_by
  on public.user_submissions (submitted_by);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.user_submissions enable row level security;

-- Only authenticated users can insert submissions
create policy "user_submissions_insert_authenticated"
  on public.user_submissions for insert
  with check (auth.uid() is not null);

-- Users can read their own submissions; admins read all via service role
create policy "user_submissions_select_own"
  on public.user_submissions for select
  using (auth.uid() = submitted_by);
