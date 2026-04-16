-- ============================================================
-- Migration 045: Demo booking chat tables
-- ============================================================

-- Global config for the demo booking chat agent (singleton row)
CREATE TABLE IF NOT EXISTS demo_chat_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_statement TEXT NOT NULL DEFAULT 'How can I help you today?',
  agent_goal TEXT NOT NULL DEFAULT 'Help visitors understand the platform and book a demo.',
  custom_instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default config row
INSERT INTO demo_chat_config (opening_statement, agent_goal) VALUES
  ('How can I help you today?', 'Help visitors understand the platform and book a demo.');

-- Demo chat sessions
CREATE TABLE IF NOT EXISTS demo_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  visitor_name TEXT,
  visitor_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Demo chat messages
CREATE TABLE IF NOT EXISTS demo_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES demo_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('visitor', 'agent')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_chat_messages_session
  ON demo_chat_messages(session_id);

-- RLS
ALTER TABLE demo_chat_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage demo_chat_config"
  ON demo_chat_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins manage demo_chat_sessions"
  ON demo_chat_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins manage demo_chat_messages"
  ON demo_chat_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );
