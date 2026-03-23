-- ScaleCPG (LUMIERE) Initial Schema Migration
-- Creates all application tables with UUID primary keys and wide-open RLS policies.

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. clients
-- ============================================================================
create table clients (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  slug          text        unique not null,
  status        text        not null default 'active',
  sku_count     int,
  message_count int,
  accent_color  text,
  logo_bg       text,
  logo_color    text,
  created_at    timestamptz not null default now()
);

alter table clients enable row level security;

create policy "Allow all access on clients"
  on clients for all
  using (true)
  with check (true);

-- ============================================================================
-- 2. client_applications
-- ============================================================================
create table client_applications (
  id              uuid        primary key default gen_random_uuid(),
  brand_name      text        not null,
  contact_name    text,
  submission_date text,
  status          text        not null default 'pending',
  accent_color    text,
  logo_bg         text,
  logo_color      text,
  created_at      timestamptz not null default now()
);

alter table client_applications enable row level security;

create policy "Allow all access on client_applications"
  on client_applications for all
  using (true)
  with check (true);

-- ============================================================================
-- 3. products
-- ============================================================================
create table products (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  category    text,
  description text,
  price_min   numeric,
  price_max   numeric,
  moq         int,
  lead_time   text,
  created_at  timestamptz not null default now()
);

alter table products enable row level security;

create policy "Allow all access on products"
  on products for all
  using (true)
  with check (true);

-- ============================================================================
-- 4. client_products
-- ============================================================================
create table client_products (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients (id) on delete cascade,
  product_name text,
  sku          text,
  category     text,
  status       text,
  volume       text
);

alter table client_products enable row level security;

create policy "Allow all access on client_products"
  on client_products for all
  using (true)
  with check (true);

-- ============================================================================
-- 5. orders
-- ============================================================================
create table orders (
  id             uuid        primary key default gen_random_uuid(),
  order_number   text,
  client_id      uuid        references clients (id) on delete set null,
  client_name    text,
  product_name   text,
  quantity       int,
  status         text,
  requested_date text,
  created_at     timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Allow all access on orders"
  on orders for all
  using (true)
  with check (true);

-- ============================================================================
-- 6. inventory_items
-- ============================================================================
create table inventory_items (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  sku         text,
  category    text,
  stock_qty   text,
  stock_pct   int,
  stock_level text,
  status      text,
  on_order    boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table inventory_items enable row level security;

create policy "Allow all access on inventory_items"
  on inventory_items for all
  using (true)
  with check (true);

-- ============================================================================
-- 7. alerts
-- ============================================================================
create table alerts (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  severity    text,
  created_at  timestamptz not null default now()
);

alter table alerts enable row level security;

create policy "Allow all access on alerts"
  on alerts for all
  using (true)
  with check (true);

-- ============================================================================
-- 8. formulations
-- ============================================================================
create table formulations (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  category          text,
  subtitle          text,
  ingredients       text[],
  packaging_options text[],
  add_ons           text[],
  created_at        timestamptz not null default now()
);

alter table formulations enable row level security;

create policy "Allow all access on formulations"
  on formulations for all
  using (true)
  with check (true);

-- ============================================================================
-- 9. activities
-- ============================================================================
create table activities (
  id           uuid        primary key default gen_random_uuid(),
  type         text,
  title        text        not null,
  description  text,
  accent_color text,
  time_label   text,
  created_at   timestamptz not null default now()
);

alter table activities enable row level security;

create policy "Allow all access on activities"
  on activities for all
  using (true)
  with check (true);

-- ============================================================================
-- 10. client_messages
-- ============================================================================
create table client_messages (
  id        uuid        primary key default gen_random_uuid(),
  client_id uuid        not null references clients (id) on delete cascade,
  from_name text,
  subject   text,
  sent_date text,
  status    text,
  created_at timestamptz not null default now()
);

alter table client_messages enable row level security;

create policy "Allow all access on client_messages"
  on client_messages for all
  using (true)
  with check (true);

-- ============================================================================
-- 11. client_orders
-- ============================================================================
create table client_orders (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references clients (id) on delete cascade,
  order_number   text,
  product_name   text,
  quantity       text,
  requested_date text,
  status         text
);

alter table client_orders enable row level security;

create policy "Allow all access on client_orders"
  on client_orders for all
  using (true)
  with check (true);
