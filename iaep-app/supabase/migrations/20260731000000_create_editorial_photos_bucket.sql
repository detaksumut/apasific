-- Create the editorial_photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('editorial_photos', 'editorial_photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Setup RLS policies for the bucket
-- Allow public access for reading
DROP POLICY IF EXISTS "Public Access to Editorial Photos" ON storage.objects;
CREATE POLICY "Public Access to Editorial Photos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'editorial_photos' );

-- Allow authenticated users to upload (or update) photos
DROP POLICY IF EXISTS "Authenticated users can upload editorial photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload editorial photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'editorial_photos'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated users can update editorial photos" ON storage.objects;
CREATE POLICY "Authenticated users can update editorial photos"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'editorial_photos'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated users can delete editorial photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete editorial photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'editorial_photos'
  AND auth.role() = 'authenticated'
);
