-- ============================================================
-- Migration 044: Storage bucket for custom instruction files
-- ============================================================

-- Create a private storage bucket for instruction file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('instruction-files', 'instruction-files', false)
ON CONFLICT (id) DO NOTHING;

-- Super admins can upload/read/delete files
CREATE POLICY "Super admins manage instruction files"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'instruction-files'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Service role (admin client) can read files for AI prompt building
CREATE POLICY "Service role reads instruction files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'instruction-files');
