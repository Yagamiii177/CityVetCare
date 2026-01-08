-- Insert Sample Animal Catcher Data directly into dog_catcher table
-- This adds 12 animal catchers for testing the patrol schedule feature

INSERT INTO dog_catcher (full_name, contact_number) VALUES
('Carlos Mendoza', '+63 912 345 6789'),
('Maria Santos', '+63 923 456 7890'),
('Juan Reyes', '+63 934 567 8901'),
('Anna Garcia', '+63 945 678 9012'),
('Roberto Cruz', '+63 956 789 0123'),
('Sofia Diaz', '+63 967 890 1234'),
('Miguel Torres', '+63 978 901 2345'),
('Elena Rodriguez', '+63 989 012 3456'),
('Diego Hernandez', '+63 910 123 4567'),
('Isabella Lopez', '+63 921 234 5678'),
('Fernando Gomez', '+63 932 345 6789'),
('Carmen Flores', '+63 943 456 7890');

-- Verify the data
SELECT 
    catcher_id,
    full_name,
    contact_number,
    date_created
FROM dog_catcher
ORDER BY catcher_id;
