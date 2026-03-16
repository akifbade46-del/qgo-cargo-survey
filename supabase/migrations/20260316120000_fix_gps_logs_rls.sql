-- Fix RLS policies for gps_logs table
-- Allow service role to insert GPS logs (for OwnTracks webhook)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS gps_logs_insert_service ON gps_logs;
DROP POLICY IF EXISTS gps_logs_select_authenticated ON gps_logs;

-- Allow service role to insert GPS logs
CREATE POLICY gps_logs_insert_service
ON gps_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to select GPS logs
CREATE POLICY gps_logs_select_authenticated
ON gps_logs FOR SELECT
TO authenticated
USING (true);

-- Allow service role to update GPS logs
CREATE POLICY gps_logs_update_service
ON gps_logs FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
