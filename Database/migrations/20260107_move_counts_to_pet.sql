-- Migration: move capture/redemption counters from stray_animals to pet
-- Adds counters to pet table and removes them from stray_animals

ALTER TABLE pet
  ADD COLUMN IF NOT EXISTS capture_count INT NOT NULL DEFAULT 0 AFTER status,
  ADD COLUMN IF NOT EXISTS redemption_count INT NOT NULL DEFAULT 0 AFTER capture_count;

ALTER TABLE stray_animals
  DROP COLUMN IF EXISTS capture_count,
  DROP COLUMN IF EXISTS redemption_count;
