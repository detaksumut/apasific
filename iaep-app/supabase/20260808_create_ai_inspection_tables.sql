-- SQL Migration: Setup AI Inspection Tables

-- 1. Create table for storing Canonical Paragraphs
CREATE TABLE IF NOT EXISTS submission_canonical_paragraphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  paragraph_hash VARCHAR(64) NOT NULL,
  page_number INT NOT NULL,
  paragraph_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(submission_id, paragraph_hash)
);

CREATE INDEX IF NOT EXISTS idx_canonical_submission ON submission_canonical_paragraphs(submission_id);

-- 2. Create table for storing AI Inspection Findings
CREATE TABLE IF NOT EXISTS ai_inspection_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  paragraph_hash VARCHAR(64) NOT NULL,
  page_number INT NOT NULL,
  
  -- Classifications
  category VARCHAR(50) NOT NULL,       -- 'Technical', 'Scientific', 'Editorial', 'Ethics', 'Metadata', 'References', 'Language'
  severity VARCHAR(10) NOT NULL,       -- 'high' (🔴), 'medium' (🟠), 'low' (🟡)
  confidence_score INT NOT NULL,       -- 0-100
  
  -- Explanations
  finding_title VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  action_prompt TEXT NOT NULL,
  
  -- Audit Trail
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  prompt_version VARCHAR(20) NOT NULL,
  
  -- Reviewer Feedback Loop
  reviewer_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'confirmed', 'partially_confirmed', 'ignored', 'false_positive'
  reviewer_feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_findings_submission ON ai_inspection_findings(submission_id);
CREATE INDEX IF NOT EXISTS idx_ai_findings_hash ON ai_inspection_findings(paragraph_hash);
