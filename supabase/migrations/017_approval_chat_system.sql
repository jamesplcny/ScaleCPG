-- ============================================================
-- 017: Approval workflow + Chat system
-- ============================================================

-- 1) Extend brand_manufacturer_applications with rejection/acceptance fields
ALTER TABLE public.brand_manufacturer_applications
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_until timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Drop the unique constraint so a brand can re-apply after rejection cooldown
ALTER TABLE public.brand_manufacturer_applications
  DROP CONSTRAINT IF EXISTS brand_manufacturer_applications_brand_manufacturer_unique;

-- 2) Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturer_profiles(id) ON DELETE CASCADE,
  application_id uuid REFERENCES public.brand_manufacturer_applications(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(brand_id, manufacturer_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Brand users can see their own conversations
DROP POLICY IF EXISTS "brand_select_own_conversations" ON public.conversations;
CREATE POLICY "brand_select_own_conversations"
  ON public.conversations FOR SELECT
  USING (
    brand_id IN (
      SELECT bu.brand_id FROM public.brand_users bu
      WHERE bu.user_id = auth.uid() AND bu.status = 'active'
    )
  );

-- Manufacturer users can see their own conversations
DROP POLICY IF EXISTS "manufacturer_select_own_conversations" ON public.conversations;
CREATE POLICY "manufacturer_select_own_conversations"
  ON public.conversations FOR SELECT
  USING (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- Manufacturer users can insert conversations (created on accept)
DROP POLICY IF EXISTS "manufacturer_insert_conversations" ON public.conversations;
CREATE POLICY "manufacturer_insert_conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    manufacturer_id IN (
      SELECT mp.id FROM public.manufacturer_profiles mp
      WHERE mp.user_id = auth.uid()
    )
  );

-- 3) Conversation messages table
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES auth.users(id),
  sender_role text NOT NULL CHECK (sender_role IN ('brand_user', 'manufacturer_user')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages in conversations they belong to
DROP POLICY IF EXISTS "select_own_conversation_messages" ON public.conversation_messages;
CREATE POLICY "select_own_conversation_messages"
  ON public.conversation_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.brand_id IN (
        SELECT bu.brand_id FROM public.brand_users bu
        WHERE bu.user_id = auth.uid() AND bu.status = 'active'
      )
      OR c.manufacturer_id IN (
        SELECT mp.id FROM public.manufacturer_profiles mp
        WHERE mp.user_id = auth.uid()
      )
    )
  );

-- Users can insert messages in conversations they belong to
DROP POLICY IF EXISTS "insert_own_conversation_messages" ON public.conversation_messages;
CREATE POLICY "insert_own_conversation_messages"
  ON public.conversation_messages FOR INSERT
  WITH CHECK (
    sender_user_id = auth.uid()
    AND conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.brand_id IN (
        SELECT bu.brand_id FROM public.brand_users bu
        WHERE bu.user_id = auth.uid() AND bu.status = 'active'
      )
      OR c.manufacturer_id IN (
        SELECT mp.id FROM public.manufacturer_profiles mp
        WHERE mp.user_id = auth.uid()
      )
    )
  );

-- 4) Index for faster message queries
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id
  ON public.conversation_messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_brand_id
  ON public.conversations(brand_id);

CREATE INDEX IF NOT EXISTS idx_conversations_manufacturer_id
  ON public.conversations(manufacturer_id);

CREATE INDEX IF NOT EXISTS idx_applications_manufacturer_id
  ON public.brand_manufacturer_applications(manufacturer_id, status);

CREATE INDEX IF NOT EXISTS idx_applications_brand_id
  ON public.brand_manufacturer_applications(brand_id, status);
