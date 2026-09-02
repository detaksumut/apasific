-- Migration: AI Chat Messages (APASIFIC AI Chatbot)
-- Created: 2026-09-03
-- Purpose:
--   1. Create ai_chat_messages table for persistent AI chat history
--   2. One user can have many chat messages (user ↔ AI conversations)
--   3. Row-Level Security: users can only read/write their own messages

-- ── 1. Create ai_chat_messages table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Indexes ─────────────────────────────────────────────────────────────
-- Primary query pattern: history for a specific user, newest first
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id
  ON public.ai_chat_messages(user_id, created_at DESC);

-- ── 3. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can read only their own messages
DROP POLICY IF EXISTS "Users read own AI chat messages" ON public.ai_chat_messages;
CREATE POLICY "Users read own AI chat messages"
  ON public.ai_chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert only their own messages (both 'user' and 'assistant' roles)
-- The API server validates role; RLS ensures user_id matches session
DROP POLICY IF EXISTS "Users insert own AI chat messages" ON public.ai_chat_messages;
CREATE POLICY "Users insert own AI chat messages"
  ON public.ai_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── 4. Comment ──────────────────────────────────────────────────────────────
COMMENT ON TABLE public.ai_chat_messages IS
  'AI Chat message history. Each row is one message in a user-to-AI conversation. Phase 1: public knowledge only.';
