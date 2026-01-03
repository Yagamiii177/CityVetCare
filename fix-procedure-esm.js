// Fix the sp_incidents_update stored procedure
import { pool } from './Backend-Node/config/database.js';
import fs from 'fs';

async function fixStoredProcedure() {
  try {
    console.log('✓ Connected to database');

    // Read the SQL fix
    const sql = fs.readFileSync('./fix-update-procedure.sql', 'utf8');
    
    console.log('🔧 Fixing sp_incidents_update procedure...');
    
    // First drop the existing procedure
    console.log('  - Dropping old procedure...');
    await pool.query('DROP PROCEDURE IF EXISTS sp_incidents_update');
    
    // Create the new procedure (manually constructed to avoid parsing issues)
    const createProcedure = `
CREATE PROCEDURE sp_incidents_update(
    IN p_id INT,
    IN p_reporter_name VARCHAR(100),
    IN p_reporter_contact VARCHAR(20),
    IN p_title VARCHAR(200),
    IN p_description TEXT,
    IN p_location VARCHAR(255),
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8),
    IN p_incident_date DATETIME,
    IN p_priority VARCHAR(20),
    IN p_status VARCHAR(20),
    IN p_images JSON,
    IN p_assigned_catcher_id INT,
    IN p_incident_type VARCHAR(20),
    IN p_pet_color VARCHAR(100),
    IN p_pet_breed VARCHAR(100),
    IN p_animal_type VARCHAR(20),
    IN p_pet_gender VARCHAR(20),
    IN p_pet_size VARCHAR(20)
)
BEGIN
    UPDATE incidents
    SET
        reporter_name = IFNULL(p_reporter_name, reporter_name),
        reporter_contact = IFNULL(p_reporter_contact, reporter_contact),
        title = IFNULL(p_title, title),
        description = IFNULL(p_description, description),
        location = IFNULL(p_location, location),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
        incident_date = IFNULL(p_incident_date, incident_date),
        priority = IFNULL(p_priority, priority),
        status = IFNULL(p_status, status),
        images = IFNULL(p_images, images),
        assigned_catcher_id = IFNULL(p_assigned_catcher_id, assigned_catcher_id),
        incident_type = IFNULL(p_incident_type, incident_type),
        pet_color = IFNULL(p_pet_color, pet_color),
        pet_breed = IFNULL(p_pet_breed, pet_breed),
        animal_type = IFNULL(p_animal_type, animal_type),
        pet_gender = IFNULL(p_pet_gender, pet_gender),
        pet_size = IFNULL(p_pet_size, pet_size),
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END`;
    
    console.log('  - Creating new procedure with mobile fields...');
    await pool.query(createProcedure);
    
    console.log('✅ Stored procedure fixed successfully!');
    console.log('');
    console.log('The sp_incidents_update procedure now has:');
    console.log('  - All mobile report fields (incident_type, pet_color, etc.)');
    console.log('  - Correct WHERE clause using "id" column');
    console.log('');
    console.log('You can now approve/reject reports without errors!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixStoredProcedure();
