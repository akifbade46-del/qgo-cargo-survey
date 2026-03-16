-- Create gps_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gps_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surveyor_id UUID NOT NULL,
  survey_request_id UUID,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  accuracy DECIMAL(10, 2),
  speed DECIMAL(10, 2),
  altitude DECIMAL(10, 2),
  battery_level INTEGER,
  source TEXT DEFAULT 'browser',
  timestamp TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gps_logs_surveyor_id ON public.gps_logs(surveyor_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_survey_request_id ON public.gps_logs(survey_request_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_timestamp ON public.gps_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gps_logs_source ON public.gps_logs(source);

-- Enable RLS
ALTER TABLE public.gps_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS gps_logs_insert_service ON public.gps_logs;
DROP POLICY IF EXISTS gps_logs_select_authenticated ON public.gps_logs;
DROP POLICY IF EXISTS gps_logs_update_service ON public.gps_logs;

-- Allow service role to insert GPS logs (for OwnTracks webhook)
CREATE POLICY gps_logs_insert_service
ON public.gps_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to select GPS logs
CREATE POLICY gps_logs_select_authenticated
ON public.gps_logs FOR SELECT
TO authenticated
USING (true);

-- Allow service role to update GPS logs
CREATE POLICY gps_logs_update_service
ON public.gps_logs FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.gps_logs TO service_role;
GRANT SELECT ON public.gps_logs TO authenticated;
