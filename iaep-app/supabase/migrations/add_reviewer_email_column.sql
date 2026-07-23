-- Tambahkan kolom reviewer_email dan reviewer_name ke tabel review_assignments
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE review_assignments 
  ADD COLUMN IF NOT EXISTS reviewer_email TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

-- Index untuk mempercepat pencarian berdasarkan email
CREATE INDEX IF NOT EXISTS idx_review_assignments_reviewer_email 
  ON review_assignments(reviewer_email);

-- Tampilkan hasil
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'review_assignments' 
ORDER BY ordinal_position;
