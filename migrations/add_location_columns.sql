-- Add location columns to survey_requests table
-- This allows customers to pin their pickup and destination locations on a map

-- Add columns for "Moving From" location
ALTER TABLE survey_requests
ADD COLUMN IF NOT EXISTS from_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS from_lng DOUBLE PRECISION;

-- Add columns for "Moving To" location
ALTER TABLE survey_requests
ADD COLUMN IF NOT EXISTS to_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS to_lng DOUBLE PRECISION;

-- Add comment for documentation
COMMENT ON COLUMN survey_requests.from_lat IS 'Latitude for pickup location (Moving From)';
COMMENT ON COLUMN survey_requests.from_lng IS 'Longitude for pickup location (Moving From)';
COMMENT ON COLUMN survey_requests.to_lat IS 'Latitude for destination location (Moving To)';
COMMENT ON COLUMN survey_requests.to_lng IS 'Longitude for destination location (Moving To)';
