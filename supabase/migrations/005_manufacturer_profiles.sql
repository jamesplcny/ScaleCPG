-- Manufacturer profile info (company name, description, MOQ)
CREATE TABLE manufacturer_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name  text NOT NULL DEFAULT '',
  company_description text NOT NULL DEFAULT '',
  moq           text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_manufacturer_profiles_user_id ON manufacturer_profiles(user_id);
ALTER TABLE manufacturer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own" ON manufacturer_profiles FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "insert own" ON manufacturer_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own" ON manufacturer_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Links profile to products shown on public profile
CREATE TABLE profile_skus (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_profile_skus_user_id ON profile_skus(user_id);
ALTER TABLE profile_skus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own" ON profile_skus FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "insert own" ON profile_skus FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete own" ON profile_skus FOR DELETE
  USING (user_id = auth.uid());
