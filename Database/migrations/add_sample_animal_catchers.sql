-- Add Sample Animal Catcher Data (10+ members)
-- This migration populates the dog_catcher table with sample patrol staff

-- First, check if sample data already exists
SET @existing_count = (SELECT COUNT(*) FROM dog_catcher);

-- Only insert if there are fewer than 10 catchers
INSERT INTO dog_catcher (full_name, contact_number)
SELECT * FROM (
    SELECT 'Carlos Mendoza', '+63 912 345 6789'
    UNION ALL SELECT 'Maria Santos', '+63 923 456 7890'
    UNION ALL SELECT 'Juan Reyes', '+63 934 567 8901'
    UNION ALL SELECT 'Anna Garcia', '+63 945 678 9012'
    UNION ALL SELECT 'Roberto Cruz', '+63 956 789 0123'
    UNION ALL SELECT 'Sofia Diaz', '+63 967 890 1234'
    UNION ALL SELECT 'Miguel Torres', '+63 978 901 2345'
    UNION ALL SELECT 'Elena Rodriguez', '+63 989 012 3456'
    UNION ALL SELECT 'Diego Hernandez', '+63 910 123 4567'
    UNION ALL SELECT 'Isabella Lopez', '+63 921 234 5678'
    UNION ALL SELECT 'Fernando Gomez', '+63 932 345 6789'
    UNION ALL SELECT 'Carmen Flores', '+63 943 456 7890'
) AS sample_data
WHERE @existing_count < 10;

-- Verify the data
SELECT 
    catcher_id,
    full_name,
    contact_number,
    date_created
FROM dog_catcher
ORDER BY catcher_id;
