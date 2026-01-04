-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography columns for efficient distance queries
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_geo geography(Point, 4326);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS location_geo geography(Point, 4326);
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS location_geo geography(Point, 4326);

-- Create spatial indexes for fast geospatial queries
CREATE INDEX IF NOT EXISTS idx_profiles_location_geo ON profiles USING GIST(location_geo);
CREATE INDEX IF NOT EXISTS idx_clinics_location_geo ON clinics USING GIST(location_geo);
CREATE INDEX IF NOT EXISTS idx_shifts_location_geo ON shifts USING GIST(location_geo);

-- Create function to update location_geo when lat/lng changes
CREATE OR REPLACE FUNCTION update_location_geo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_lat IS NOT NULL AND NEW.location_lng IS NOT NULL THEN
    NEW.location_geo = ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326)::geography;
  ELSE
    NEW.location_geo = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers to auto-update location_geo
DROP TRIGGER IF EXISTS profiles_location_geo_trigger ON profiles;
CREATE TRIGGER profiles_location_geo_trigger
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_location_geo();

DROP TRIGGER IF EXISTS clinics_location_geo_trigger ON clinics;
CREATE TRIGGER clinics_location_geo_trigger
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_location_geo();

DROP TRIGGER IF EXISTS shifts_location_geo_trigger ON shifts;
CREATE TRIGGER shifts_location_geo_trigger
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_location_geo();

-- Create function to find shifts within a given distance from a point
CREATE OR REPLACE FUNCTION find_shifts_within_distance(
  user_lat double precision,
  user_lng double precision,
  max_distance_km double precision DEFAULT 50
)
RETURNS TABLE (
  shift_id uuid,
  distance_km double precision
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT 
    s.id as shift_id,
    ST_Distance(
      s.location_geo,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000 as distance_km
  FROM shifts s
  WHERE s.location_geo IS NOT NULL
    AND s.is_filled = false
    AND ST_DWithin(
      s.location_geo,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      max_distance_km * 1000
    )
  ORDER BY distance_km;
$$;

-- Update existing records to populate location_geo based on existing lat/lng
UPDATE profiles 
SET location_geo = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)::geography
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

UPDATE clinics 
SET location_geo = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)::geography
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

UPDATE shifts 
SET location_geo = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)::geography
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;