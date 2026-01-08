-- Create a test pet owner with properly hashed password for testing authenticated reports
-- Password: testpass123
-- Bcrypt hash with salt rounds = 10

USE cityvetcare_db;

-- Check if test owner already exists
SET @test_owner_exists = (SELECT COUNT(*) FROM pet_owner WHERE email = 'test@owner.com');

-- Only insert if doesn't exist
INSERT INTO pet_owner (full_name, email, password, contact_number, address) 
SELECT * FROM (SELECT 
  'Test Owner',
  'test@owner.com',
  '$2b$10$YourTestHashHere.ReplaceMe',  -- This will be updated by the Node script
  '09123456789',
  '123 Test Street'
) AS tmp
WHERE @test_owner_exists = 0;

SELECT 'Test owner account created or already exists' AS result;
SELECT owner_id, full_name, email, contact_number 
FROM pet_owner 
WHERE email = 'test@owner.com';
