-- Migration: add status and counters to stray_animals
-- Adds status, capture_count, redemption_count for RFID-based tracking

ALTER TABLE stray_animals
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'captured' AFTER location_captured,
  ADD COLUMN IF NOT EXISTS capture_count INT NOT NULL DEFAULT 0 AFTER status,
  ADD COLUMN IF NOT EXISTS redemption_count INT NOT NULL DEFAULT 0 AFTER capture_count;
