-- Create assets bucket for logos and branding
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Allow authenticated users to upload
CREATE POLICY "Allow uploads for authenticated users"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assets'
  AND auth.role() = 'authenticated'
);

-- Allow users to update their uploads
CREATE POLICY "Allow updates for authenticated users"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assets'
  AND auth.role() = 'authenticated'
);
