-- Migration: Replace clients table with auth-scoped version
-- Drops old demo-only tables that depended on the previous clients schema

-- Drop dependent demo tables (all contained only hardcoded fallback data)
DROP TABLE IF EXISTS client_orders CASCADE;
DROP TABLE IF EXISTS client_messages CASCADE;
DROP TABLE IF EXISTS client_products CASCADE;
DROP TABLE IF EXISTS client_applications CASCADE;

-- Drop old clients table (CASCADE removes the orders.client_id FK — that column stays, FK removed)
DROP TABLE IF EXISTS clients CASCADE;

-- Recreate clients: minimal, auth-scoped
CREATE TABLE clients (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_user_id_created_at ON clients(user_id, created_at DESC);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own" ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "insert own" ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update own" ON clients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "delete own" ON clients FOR DELETE
  USING (user_id = auth.uid());
