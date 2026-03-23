-- Migration 014: Manufacturer application/approval workflow
-- Adds status column to manufacturer_profiles with CHECK constraint.
-- Updates RLS so brands only see approved manufacturers.

-- 1. Add status column
ALTER TABLE manufacturer_profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

ALTER TABLE manufacturer_profiles
  ADD CONSTRAINT manufacturer_profiles_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. Mark any existing profiles as approved (grandfathered in)
UPDATE manufacturer_profiles SET status = 'approved' WHERE status = 'pending';

-- 3. Drop old RLS policies and replace with status-aware ones
DROP POLICY IF EXISTS "select own" ON manufacturer_profiles;
DROP POLICY IF EXISTS "public read" ON manufacturer_profiles;
DROP POLICY IF EXISTS "insert own" ON manufacturer_profiles;
DROP POLICY IF EXISTS "update own" ON manufacturer_profiles;

-- Owner can always see their own profile (regardless of status)
CREATE POLICY "select own profile" ON manufacturer_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Brands (and public) can only see approved profiles
CREATE POLICY "select approved profiles" ON manufacturer_profiles FOR SELECT
  USING (status = 'approved');

-- Manufacturer can insert their own profile
CREATE POLICY "insert own profile" ON manufacturer_profiles FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('manufacturer_user', 'manufacturer_admin')
    )
  );

-- Manufacturer can update their own profile (but NOT the status column —
-- status updates are done manually in Supabase Table Editor via service role)
CREATE POLICY "update own profile" ON manufacturer_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Fix user_roles CHECK constraint to accept manufacturer_user
-- (the original migration only had 'manufacturer_admin')
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('manufacturer_user', 'manufacturer_admin', 'brand_user'));
