-- Add birthdate and optional home coordinates to pet_owner
-- This supports mobile registration collecting birthdate + map-picked home address.

ALTER TABLE pet_owner
  ADD COLUMN birthdate DATE NULL AFTER full_name,
  ADD COLUMN home_latitude DECIMAL(10,7) NULL AFTER address,
  ADD COLUMN home_longitude DECIMAL(10,7) NULL AFTER home_latitude;
