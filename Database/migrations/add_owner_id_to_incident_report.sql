-- Add owner_id column to incident_report table
-- This links authenticated mobile reports to pet owners

USE cityvetcare_db;

-- Add owner_id column (nullable for backward compatibility with anonymous reports)
ALTER TABLE incident_report 
ADD COLUMN owner_id INT NULL AFTER reporter_id,
ADD CONSTRAINT fk_incident_owner 
  FOREIGN KEY (owner_id) REFERENCES pet_owner(owner_id) 
  ON DELETE SET NULL,
ADD INDEX idx_owner_id (owner_id);

-- Add comment for documentation
ALTER TABLE incident_report 
MODIFY COLUMN owner_id INT NULL 
COMMENT 'Pet owner who submitted the report (NULL for anonymous emergency reports)';

SELECT 'Migration completed successfully: owner_id added to incident_report table' AS result;
