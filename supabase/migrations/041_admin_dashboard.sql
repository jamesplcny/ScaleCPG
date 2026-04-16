-- ============================================================
-- Migration 041: Admin dashboard support
-- ============================================================

-- 1. Admin-managed manufacturers table
CREATE TABLE IF NOT EXISTS admin_manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  manufacturer_profile_id UUID REFERENCES manufacturer_profiles(id) ON DELETE SET NULL,
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'onboarding')),
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Admin invitations table
CREATE TABLE IF NOT EXISTS admin_manufacturer_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_manufacturer_id UUID NOT NULL REFERENCES admin_manufacturers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by_user_id UUID NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_mfg_invitations_email
  ON admin_manufacturer_invitations(email);

CREATE INDEX IF NOT EXISTS idx_admin_mfg_invitations_mfg_id
  ON admin_manufacturer_invitations(admin_manufacturer_id);

-- 3. RLS policies
ALTER TABLE admin_manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_manufacturer_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage admin_manufacturers"
  ON admin_manufacturers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins manage invitations"
  ON admin_manufacturer_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

CREATE POLICY "Manufacturers can view own invitations"
  ON admin_manufacturer_invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
