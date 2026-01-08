-- Migration: Add 'adopted' to stray_animals.status enum
-- Date: 2026-01-08

USE cityvetcare_db;

-- Ensure the enum includes all statuses used by the app:
-- captured, adoption, adopted, euthanized, claimed
ALTER TABLE stray_animals
  MODIFY COLUMN status ENUM('captured', 'adoption', 'adopted', 'euthanized', 'claimed')
  NOT NULL DEFAULT 'captured';
