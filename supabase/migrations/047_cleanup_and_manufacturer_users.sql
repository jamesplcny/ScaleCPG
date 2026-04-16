-- ============================================================
-- Migration 047: Drop unused tables + add manufacturer_users
-- ============================================================

-- 1. Drop legacy CRM scaffolding (initial commit, never wired into current product)
DROP TABLE IF EXISTS ups_shipments      CASCADE;
DROP TABLE IF EXISTS activities         CASCADE;
DROP TABLE IF EXISTS formulations       CASCADE;
DROP TABLE IF EXISTS alerts             CASCADE;
DROP TABLE IF EXISTS inventory_items    CASCADE;
DROP TABLE IF EXISTS orders             CASCADE;
DROP TABLE IF EXISTS products           CASCADE;
DROP TABLE IF EXISTS categories         CASCADE;
DROP TABLE IF EXISTS clients            CASCADE;

-- 2. Drop orphaned feature tables (catalog / PO / shipments / conversations / applications)
DROP TABLE IF EXISTS shipment_request_items          CASCADE;
DROP TABLE IF EXISTS shipment_requests               CASCADE;
DROP TABLE IF EXISTS status_report_items             CASCADE;
DROP TABLE IF EXISTS purchase_order_items            CASCADE;
DROP TABLE IF EXISTS purchase_orders                 CASCADE;
DROP TABLE IF EXISTS approved_products               CASCADE;
DROP TABLE IF EXISTS product_catalog_requests        CASCADE;
DROP TABLE IF EXISTS conversation_messages           CASCADE;
DROP TABLE IF EXISTS conversations                   CASCADE;
DROP TABLE IF EXISTS brand_manufacturer_applications CASCADE;
DROP TABLE IF EXISTS brand_applications              CASCADE;
DROP TABLE IF EXISTS popular_vault_items             CASCADE;
DROP TABLE IF EXISTS accessory_vault_items           CASCADE;
DROP TABLE IF EXISTS packaging_vault_items           CASCADE;
DROP TABLE IF EXISTS profile_skus                    CASCADE;
DROP TABLE IF EXISTS brand_products                  CASCADE;

-- 3. NEW: manufacturer_users — join table linking auth.users ↔ admin_manufacturers
CREATE TABLE IF NOT EXISTS manufacturer_users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_manufacturer_id UUID NOT NULL REFERENCES admin_manufacturers(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role                  TEXT NOT NULL DEFAULT 'member'
                         CHECK (role IN ('owner', 'admin', 'member')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (admin_manufacturer_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_manufacturer_users_user_id
  ON manufacturer_users(user_id);
CREATE INDEX IF NOT EXISTS idx_manufacturer_users_mfg_id
  ON manufacturer_users(admin_manufacturer_id);

-- RLS: super admins manage everything; users can read their own membership rows
ALTER TABLE manufacturer_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage manufacturer_users"
  ON manufacturer_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'super_admin'
    )
  );

CREATE POLICY "Users see their own manufacturer_users rows"
  ON manufacturer_users FOR SELECT
  USING (user_id = auth.uid());

-- 4. Backfill manufacturer_users from accepted invitations so existing
--    invited users immediately have membership records.
INSERT INTO manufacturer_users (admin_manufacturer_id, user_id, role)
SELECT DISTINCT ami.admin_manufacturer_id, u.id, 'member'
FROM admin_manufacturer_invitations ami
JOIN auth.users u ON lower(u.email) = lower(ami.email)
WHERE ami.status = 'accepted'
ON CONFLICT (admin_manufacturer_id, user_id) DO NOTHING;
