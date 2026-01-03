import { pool } from './Backend-Node/config/database.js';

async function fixStoredProcedures() {
  try {
    console.log('🔧 Fixing stored procedures...\n');

    // Drop existing procedures
    console.log('🗑️  Dropping old procedures...');
    await pool.query('DROP PROCEDURE IF EXISTS sp_incidents_create');
    await pool.query('DROP PROCEDURE IF EXISTS sp_incidents_update');
    console.log('✅ Old procedures dropped\n');

    // Create sp_incidents_create with 18 parameters
    console.log('📝 Creating sp_incidents_create with 18 parameters...');
    await pool.query(`
      CREATE PROCEDURE sp_incidents_create(
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
          INSERT INTO incidents (
              reporter_name,
              reporter_contact,
              title,
              description,
              location,
              latitude,
              longitude,
              incident_date,
              priority,
              status,
              images,
              assigned_catcher_id,
              incident_type,
              pet_color,
              pet_breed,
              animal_type,
              pet_gender,
              pet_size,
              created_at
          ) VALUES (
              p_reporter_name,
              p_reporter_contact,
              p_title,
              p_description,
              p_location,
              p_latitude,
              p_longitude,
              p_incident_date,
              p_priority,
              p_status,
              p_images,
              p_assigned_catcher_id,
              p_incident_type,
              p_pet_color,
              p_pet_breed,
              p_animal_type,
              p_pet_gender,
              p_pet_size,
              NOW()
          );
          
          SELECT LAST_INSERT_ID() as incident_id;
      END
    `);
    console.log('✅ sp_incidents_create created successfully\n');

    // Create sp_incidents_update with 19 parameters
    console.log('📝 Creating sp_incidents_update with 19 parameters...');
    await pool.query(`
      CREATE PROCEDURE sp_incidents_update(
          IN p_incident_id INT,
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
          UPDATE incidents SET
              reporter_name = p_reporter_name,
              reporter_contact = p_reporter_contact,
              title = p_title,
              description = p_description,
              location = p_location,
              latitude = p_latitude,
              longitude = p_longitude,
              incident_date = p_incident_date,
              priority = p_priority,
              status = p_status,
              images = p_images,
              assigned_catcher_id = p_assigned_catcher_id,
              incident_type = p_incident_type,
              pet_color = p_pet_color,
              pet_breed = p_pet_breed,
              animal_type = p_animal_type,
              pet_gender = p_pet_gender,
              pet_size = p_pet_size,
              updated_at = NOW()
          WHERE incident_id = p_incident_id;
          
          SELECT ROW_COUNT() as affected_rows;
      END
    `);
    console.log('✅ sp_incidents_update created successfully\n');

    console.log('🎉 All stored procedures fixed successfully!');
    console.log('✅ sp_incidents_create: 18 parameters');
    console.log('✅ sp_incidents_update: 19 parameters');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing stored procedures:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixStoredProcedures();
