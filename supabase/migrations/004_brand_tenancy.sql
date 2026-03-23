-- Migration 004: Multi-tenant brand portal
-- Adds user_roles, brands, brand_users tables, helper functions,
-- brand_id columns on scoped tables, and updated RLS policies.

-- ============================================================================
-- 1. Create all new tables first (no policies yet — avoids cross-reference errors)
-- ============================================================================

-- user_roles — maps auth users to manufacturer_admin or brand_user
CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    text NOT NULL CHECK (role IN ('manufacturer_admin', 'brand_user')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- brands — tenant entity (one per client brand)
CREATE TABLE brands (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_brands_user_id ON brands(user_id);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- brand_users — links brand users to brands (invite system)
CREATE TABLE brand_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id      uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text,
  role          text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, invited_email)
);
CREATE INDEX idx_brand_users_user_id ON brand_users(user_id);
CREATE INDEX idx_brand_users_invited_email ON brand_users(invited_email);
ALTER TABLE brand_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. RLS policies for the new tables (all tables exist now, safe to cross-reference)
-- ============================================================================

-- user_roles policies
CREATE POLICY "select own role" ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "insert own role" ON user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- brands policies
CREATE POLICY "select brands" ON brands FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manufacturer_admin')
    OR id IN (SELECT brand_id FROM brand_users WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "insert brands" ON brands FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update brands" ON brands FOR UPDATE
  USING (user_id = auth.uid());

-- brand_users policies
CREATE POLICY "select brand_users" ON brand_users FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manufacturer_admin')
    OR brand_id IN (SELECT bu.brand_id FROM brand_users bu WHERE bu.user_id = auth.uid() AND bu.status = 'active')
  );

CREATE POLICY "insert brand_users" ON brand_users FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manufacturer_admin')
  );

CREATE POLICY "update brand_users" ON brand_users FOR UPDATE
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manufacturer_admin')
  );

-- ============================================================================
-- 3. Helper functions (SECURITY DEFINER for use in RLS policies)
-- ============================================================================
CREATE OR REPLACE FUNCTION is_manufacturer_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manufacturer_admin'
  );
$$;

CREATE OR REPLACE FUNCTION my_brand_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT brand_id FROM brand_users WHERE user_id = auth.uid() AND status = 'active';
$$;

-- ============================================================================
-- 4. Add brand_id columns to scoped tables
-- ============================================================================
ALTER TABLE clients         ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE products        ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE categories      ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE orders          ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE inventory_items ADD COLUMN brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX idx_clients_brand_id ON clients(brand_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_orders_brand_id ON orders(brand_id);

-- ============================================================================
-- 5. Drop old RLS policies and create new dual-path policies
-- ============================================================================

-- --- clients (from migration 002) ---
DROP POLICY IF EXISTS "select own" ON clients;
DROP POLICY IF EXISTS "insert own" ON clients;
DROP POLICY IF EXISTS "update own" ON clients;
DROP POLICY IF EXISTS "delete own" ON clients;

CREATE POLICY "select clients" ON clients FOR SELECT
  USING (user_id = auth.uid() OR is_manufacturer_admin() OR brand_id IN (SELECT my_brand_ids()));

CREATE POLICY "insert clients" ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "update clients" ON clients FOR UPDATE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "delete clients" ON clients FOR DELETE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

-- --- categories (from migration 003) ---
DROP POLICY IF EXISTS "select own" ON categories;
DROP POLICY IF EXISTS "insert own" ON categories;
DROP POLICY IF EXISTS "update own" ON categories;
DROP POLICY IF EXISTS "delete own" ON categories;

CREATE POLICY "select categories" ON categories FOR SELECT
  USING (user_id = auth.uid() OR is_manufacturer_admin() OR brand_id IN (SELECT my_brand_ids()));

CREATE POLICY "insert categories" ON categories FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "update categories" ON categories FOR UPDATE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "delete categories" ON categories FOR DELETE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

-- --- products (from migration 003) ---
DROP POLICY IF EXISTS "select own" ON products;
DROP POLICY IF EXISTS "insert own" ON products;
DROP POLICY IF EXISTS "update own" ON products;
DROP POLICY IF EXISTS "delete own" ON products;

CREATE POLICY "select products" ON products FOR SELECT
  USING (user_id = auth.uid() OR is_manufacturer_admin() OR brand_id IN (SELECT my_brand_ids()));

CREATE POLICY "insert products" ON products FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "update products" ON products FOR UPDATE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "delete products" ON products FOR DELETE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

-- --- orders (from migration 001 — "Allow all access on orders") ---
DROP POLICY IF EXISTS "Allow all access on orders" ON orders;

CREATE POLICY "select orders" ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_manufacturer_admin() OR brand_id IN (SELECT my_brand_ids()));

CREATE POLICY "insert orders" ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "update orders" ON orders FOR UPDATE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "delete orders" ON orders FOR DELETE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

-- --- inventory_items (from migration 001 — "Allow all access on inventory_items") ---
DROP POLICY IF EXISTS "Allow all access on inventory_items" ON inventory_items;

CREATE POLICY "select inventory_items" ON inventory_items FOR SELECT
  USING (user_id = auth.uid() OR is_manufacturer_admin() OR brand_id IN (SELECT my_brand_ids()));

CREATE POLICY "insert inventory_items" ON inventory_items FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "update inventory_items" ON inventory_items FOR UPDATE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "delete inventory_items" ON inventory_items FOR DELETE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

-- --- client_products (from migration 001 — "Allow all access on client_products") ---
DROP POLICY IF EXISTS "Allow all access on client_products" ON client_products;

CREATE POLICY "select client_products" ON client_products FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_manufacturer_admin()
    OR EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_products.client_id
      AND c.brand_id IN (SELECT my_brand_ids())
    )
  );

CREATE POLICY "insert client_products" ON client_products FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "update client_products" ON client_products FOR UPDATE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

CREATE POLICY "delete client_products" ON client_products FOR DELETE
  USING (user_id = auth.uid() OR is_manufacturer_admin());

-- ============================================================================
-- Done. Run backfill SQL manually after this migration:
--
--   INSERT INTO user_roles (user_id, role)
--     SELECT id, 'manufacturer_admin' FROM auth.users
--     ON CONFLICT DO NOTHING;
-- ============================================================================
