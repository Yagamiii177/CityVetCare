-- Migration: Add latitude/longitude to stray_animals for Nearby filter
ALTER TABLE stray_animals
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8) NULL AFTER location_captured,
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8) NULL AFTER latitude,
  ADD INDEX IF NOT EXISTS idx_stray_coords (latitude, longitude);
