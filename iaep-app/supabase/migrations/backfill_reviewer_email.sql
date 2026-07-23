-- Update existing review_assignments yang sudah ada tapi belum punya reviewer_email
-- dengan cara join ke tabel profiles berdasarkan reviewer_id

UPDATE review_assignments ra
SET reviewer_email = p.email,
    reviewer_name = p.full_name
FROM profiles p
WHERE ra.reviewer_id = p.id
  AND ra.reviewer_email IS NULL;

-- Cek hasilnya
SELECT id, submission_id, reviewer_id, reviewer_email, reviewer_name, status
FROM review_assignments
ORDER BY assigned_at DESC
LIMIT 20;
