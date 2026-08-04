-- Migration: Add AI Reviewer support (Target #3 — Governed AI Reviewer Agent)
-- Run this in your Supabase SQL Editor
--
-- Governance notes:
--  * AI Reviewer configuration is stored in the EXISTING `system_settings`
--    table under key 'ai_reviewer_config' (JSON value):
--      { "enabled": <bool>, "mode": "disabled" | "optional" | "mandatory",
--        "updated_at": <iso>, "updated_by": <profile id> }
--    Only SUPER_ADMIN may write this key (enforced by AIReviewerService).
--  * AI assignments carry reviewer_type = 'AI' and reviewer_id = NULL with a
--    sentinel reviewer_email, because no profiles row exists for the agent.
--  * AI Reviewer output is ADVISORY ONLY — it never updates
--    submissions.status/stage (the lifecycle gate remains the single source
--    of truth for status transitions).

-- 1. Reviewer assignment type: 'HUMAN' (default, all existing rows) or 'AI'
ALTER TABLE public.review_assignments
  ADD COLUMN IF NOT EXISTS reviewer_type TEXT DEFAULT 'HUMAN';

-- 2. Index for fast filtering of AI vs HUMAN assignments
CREATE INDEX IF NOT EXISTS idx_review_assignments_reviewer_type
  ON public.review_assignments(reviewer_type);

-- 3. No additional DDL required: the review report model
--    (recommendation / comments_for_editor / comments_for_author / score)
--    already exists on review_assignments and is reused by the AI Reviewer.