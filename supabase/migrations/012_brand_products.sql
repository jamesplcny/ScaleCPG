-- Migration 012: Brand products table
-- Products owned by brands (separate from manufacturer product catalog)

CREATE TABLE brand_products (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id   uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name       text NOT NULL,
  sku        text,
  notes      text,
  status     text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brand_products_brand_id ON brand_products(brand_id);

ALTER TABLE brand_products ENABLE ROW LEVEL SECURITY;

-- Brand owners can manage their own products
-- Uses brands.user_id to verify ownership

CREATE POLICY "select own brand products" ON brand_products FOR SELECT
  USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "insert own brand products" ON brand_products FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "update own brand products" ON brand_products FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "delete own brand products" ON brand_products FOR DELETE
  USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

-- Manufacturers can view brand products (for order context)
CREATE POLICY "manufacturers view brand products" ON brand_products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manufacturer_admin', 'manufacturer_user'))
  );
