-- Add 'claimed' status to stray_animals.status enum
-- This supports the redemption flow where an approved request can be marked as claimed.

ALTER TABLE stray_animals
  MODIFY COLUMN status ENUM('captured', 'adoption', 'euthanized', 'claimed') NOT NULL DEFAULT 'captured';
