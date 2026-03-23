-- Migration 013: Fix infinite recursion in brand_users RLS policy
-- The old "select brand_users" policy referenced brand_users within its own
-- USING clause, causing "infinite recursion detected in policy" errors.

DROP POLICY IF EXISTS "select brand_users" ON brand_users;

CREATE POLICY "select brand_users" ON brand_users FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('manufacturer_admin', 'manufacturer_user')
    )
  );

-- Also allow brand users to insert their own brand_users row during signup
DROP POLICY IF EXISTS "insert brand_users" ON brand_users;

CREATE POLICY "insert brand_users" ON brand_users FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('manufacturer_admin', 'manufacturer_user')
    )
  );
