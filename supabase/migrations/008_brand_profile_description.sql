-- Migration 008: Brand self-registration support + profile description
-- Safe to re-run (idempotent)

-- 1. Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'description'
  ) THEN
    ALTER TABLE brands ADD COLUMN description text NOT NULL DEFAULT '';
  END IF;
END $$;

-- 2. Drop old conflicting policies (safe if they don't exist)
DROP POLICY IF EXISTS "brand_self_insert" ON brands;
DROP POLICY IF EXISTS "brand_owner_update" ON brands;
DROP POLICY IF EXISTS "brand_owner_select" ON brands;
DROP POLICY IF EXISTS "brand_user_self_register" ON brand_users;
DROP POLICY IF EXISTS "user_role_self_insert" ON user_roles;

-- 3. Recreate brand_users INSERT policy to allow self-registration
-- The 004 migration only allows manufacturer_admin to insert into brand_users.
-- We need brand users to self-register too.
DROP POLICY IF EXISTS "insert brand_users" ON brand_users;
CREATE POLICY "insert brand_users" ON brand_users FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manufacturer_admin')
  );

-- 4. Recreate brand_users SELECT policy to also allow own-row access
DROP POLICY IF EXISTS "select brand_users" ON brand_users;
CREATE POLICY "select brand_users" ON brand_users FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manufacturer_admin')
    OR brand_id IN (SELECT bu.brand_id FROM brand_users bu WHERE bu.user_id = auth.uid() AND bu.status = 'active')
  );
