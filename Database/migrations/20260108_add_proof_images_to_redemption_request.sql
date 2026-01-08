-- Idempotent migration (MariaDB): add proof_images only if it does not already exist.
-- This avoids multi-statement scripts (SET/PREPARE) which may be blocked by the migration runner.

ALTER TABLE redemption_request
  ADD COLUMN IF NOT EXISTS proof_images TEXT NULL AFTER owner_contact;
