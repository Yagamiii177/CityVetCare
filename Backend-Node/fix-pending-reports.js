import { pool } from './config/database.js';
import Logger from './utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const logger = new Logger('FIX-DB');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function applyFix() {
  let connection;
  try {
    logger.info('🔧 Applying database fix for pending reports...');
    
    // Get a connection for multi-statement queries
    connection = await pool.getConnection();
    
    // Drop the old procedure
    await connection.query('DROP PROCEDURE IF EXISTS sp_incidents_update');
    logger.info('✓ Dropped old procedure');
    
    // Create the new procedure with correct parameters
    const createProcedureSQL = `
CREATE PROCEDURE sp_incidents_update(
    IN p_id INT,
    IN p_title VARCHAR(200),
    IN p_description TEXT,
    IN p_location VARCHAR(255),
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8),
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
        title = IFNULL(p_title, title),
        description = IFNULL(p_description, description),
        location = IFNULL(p_location, location),
        latitude = IFNULL(p_latitude, latitude),
        longitude = IFNULL(p_longitude, longitude),
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

    await connection.query(createProcedureSQL);
    logger.success('✓ Created new procedure with correct parameters');
    
    // Verify the procedure was created
    const [rows] = await connection.query(
      `SELECT ROUTINE_NAME, ROUTINE_TYPE 
       FROM INFORMATION_SCHEMA.ROUTINES 
       WHERE ROUTINE_SCHEMA = DATABASE() 
       AND ROUTINE_NAME = 'sp_incidents_update'`
    );
    
    if (rows.length > 0) {
      logger.success('✅ Database fix applied successfully!');
      logger.info('The pending reports approve/reject should now work.');
    } else {
      logger.error('❌ Failed to verify procedure creation');
    }
    
    connection.release();
    await pool.end();
  } catch (error) {
    if (connection) connection.release();
    logger.error('Failed to apply database fix', error);
    process.exit(1);
  }
}

applyFix();
