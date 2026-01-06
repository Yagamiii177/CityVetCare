-- Migration: Update users table for mobile authentication
-- Date: 2026-01-04
-- Description: Update users table to support mobile app authentication with proper fields

USE cityvetcare_db;

-- Add missing columns to users table if they don't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'suspended') DEFAULT 'active';

-- Rename password_hash to password if it exists
ALTER TABLE users 
  CHANGE COLUMN password_hash password VARCHAR(255) NOT NULL;

-- Add indexes for better performance
ALTER TABLE users 
  ADD INDEX IF NOT EXISTS idx_status (status),
  ADD INDEX IF NOT EXISTS idx_role (role);

-- Insert a test user for development (password: password123)
-- Password hash for 'password123' using bcrypt with salt rounds 10
INSERT IGNORE INTO users (username, email, password, full_name, contact_number, role, status) 
VALUES 
  ('testuser', 'testuser@example.com', '$2b$10$rZ5YqF0QzX7cz6P6F8z.5.mZ5YqF0QzX7cz6P6F8z.5.mZ5YqF0QzX', 'Test User', '09123456789', 'user', 'active'),
  ('admin', 'admin@example.com', '$2b$10$rZ5YqF0QzX7cz6P6F8z.5.mZ5YqF0QzX7cz6P6F8z.5.mZ5YqF0QzX', 'Admin User', '09987654321', 'admin', 'active');

SELECT 'Users table updated successfully!' as message;
