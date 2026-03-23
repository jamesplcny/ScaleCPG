-- Categories
CREATE TABLE categories (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own" ON categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert own" ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own" ON categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete own" ON categories FOR DELETE USING (user_id = auth.uid());

-- Products
CREATE TABLE products (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   uuid        NULL REFERENCES categories(id) ON DELETE SET NULL,
  name          text        NOT NULL,
  description   text        NULL,
  moq           int         NULL,
  lead_time_min int         NULL,
  lead_time_max int         NULL,
  cost_min      numeric     NULL,
  cost_max      numeric     NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_user_id ON products(user_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own" ON products FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert own" ON products FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own" ON products FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete own" ON products FOR DELETE USING (user_id = auth.uid());
