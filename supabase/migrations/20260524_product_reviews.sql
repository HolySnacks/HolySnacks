-- ─── product_reviews ──────────────────────────────────────────────────────────
-- Stores user reviews for scanned products.
-- The PostgREST join `profiles(display_name, avatar_url)` relies on the FK
-- from product_reviews.user_id → profiles.id.

create table if not exists public.product_reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  product_name  text not null,
  brand         text,
  purity_score  integer,
  rating        integer not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now()
);

-- Index for fast per-product lookups (ilike query → lower for case-insensitivity)
create index if not exists idx_product_reviews_product_name
  on public.product_reviews (lower(product_name));

-- Index for per-user lookups
create index if not exists idx_product_reviews_user_id
  on public.product_reviews (user_id);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.product_reviews enable row level security;

-- Anyone (including anon) can read reviews
create policy "reviews_select_public"
  on public.product_reviews for select
  using (true);

-- Only authenticated users can insert their own reviews
create policy "reviews_insert_authenticated"
  on public.product_reviews for insert
  with check (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "reviews_delete_own"
  on public.product_reviews for delete
  using (auth.uid() = user_id);
