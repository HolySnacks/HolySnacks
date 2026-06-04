-- ─── products ─────────────────────────────────────────────────────────────────
-- Master catalog of HolySnacks products. Replaces the hardcoded CATEGORIES
-- array in page.tsx, enabling CMS-style editing without code deploys.
-- Products are grouped by category; the category metadata (orbit radius,
-- colors, key ingredients, etc.) lives in the categories table below.

create table if not exists public.categories (
  id            text        primary key,             -- e.g. "gummies", "chocolate"
  label         text        not null,
  label_lt      text        not null,
  icon          text        not null,                -- emoji
  radius        integer     not null,
  duration      integer     not null,
  size          integer     not null,
  start_angle   integer     not null default 0,
  gradient      text        not null,
  glow          text        not null,
  ring          text        not null,
  bg_from       text        not null,
  accent_color  text        not null,
  sort_order    integer     not null default 0,
  is_active     boolean     not null default true
);

create table if not exists public.category_key_ingredients (
  id            uuid        primary key default gen_random_uuid(),
  category_id   text        not null references public.categories(id) on delete cascade,
  emoji         text        not null,
  name          text        not null,
  benefit       text        not null,
  sort_order    integer     not null default 0
);

create table if not exists public.products (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null unique,         -- URL-safe identifier, e.g. "kubix-classic"
  category_id   text        not null references public.categories(id) on delete restrict,
  name          text        not null,
  flavor        text        not null,
  price         text        not null,                -- e.g. "€4.99"
  emoji         text        not null,
  badge         text,                               -- "Bestseller" | "New" | "Coming Soon" | "Premium"
  description   text        not null,
  gradient      text        not null,
  is_active     boolean     not null default true,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now()
);

-- Indexes for category-based product listing
create index if not exists idx_products_category_id
  on public.products (category_id, sort_order);

create index if not exists idx_products_slug
  on public.products (slug);

-- ─── Row Level Security ────────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.category_key_ingredients enable row level security;
alter table public.products enable row level security;

-- Public read for all catalog tables
create policy "categories_select_public"
  on public.categories for select using (true);

create policy "key_ingredients_select_public"
  on public.category_key_ingredients for select using (true);

create policy "products_select_public"
  on public.products for select using (true);
