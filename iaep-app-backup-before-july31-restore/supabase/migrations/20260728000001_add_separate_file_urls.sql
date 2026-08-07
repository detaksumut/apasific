-- Tambah kolom untuk memisahkan naskah asli dan naskah anonim
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS original_file_url TEXT,
ADD COLUMN IF NOT EXISTS anonymous_file_url TEXT,
ADD COLUMN IF NOT EXISTS supporting_file_url TEXT;
