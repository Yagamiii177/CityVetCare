-- Migration: Add pet_count to pet_owner and backfill
USE cityvetcare_db;

ALTER TABLE pet_owner
  ADD COLUMN pet_count INT NOT NULL DEFAULT 0 AFTER password;

-- Backfill counts based on current pet table
UPDATE pet_owner po
SET pet_count = (
  SELECT COUNT(*) FROM pet p WHERE p.owner_id = po.owner_id
);
