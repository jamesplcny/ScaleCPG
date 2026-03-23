-- Brand Applications: brands apply to manufacturers from the public browse page
CREATE TABLE brand_applications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name        text NOT NULL,
  contact_email     text NOT NULL,
  contact_phone     text,
  message           text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brand_applications_manufacturer ON brand_applications(manufacturer_id);
ALTER TABLE brand_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (public browse page, no auth required)
CREATE POLICY "public insert" ON brand_applications FOR INSERT
  WITH CHECK (true);

-- Manufacturer sees own applications
CREATE POLICY "select own" ON brand_applications FOR SELECT
  USING (manufacturer_id = auth.uid());

-- Manufacturer can update status
CREATE POLICY "update own" ON brand_applications FOR UPDATE
  USING (manufacturer_id = auth.uid());
