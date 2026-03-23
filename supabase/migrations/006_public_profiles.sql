-- Allow anyone (authenticated or anon) to browse manufacturer profiles and their SKUs
CREATE POLICY "public read" ON manufacturer_profiles FOR SELECT
  USING (true);

CREATE POLICY "public read" ON profile_skus FOR SELECT
  USING (true);
