-- Fix app_settings RLS to allow authenticated users to manage settings

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated users" ON app_settings;
DROP POLICY IF EXISTS "Public read settings" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can read" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can insert" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can update" ON app_settings;

-- Allow public read (for frontend)
CREATE POLICY "Public read settings"
ON app_settings FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert"
ON app_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON app_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Clear the invalid logo_url
UPDATE app_settings SET value = '' WHERE key = 'logo_url';
