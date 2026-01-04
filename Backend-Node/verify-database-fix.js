/**
 * Database Fix Verification Script
 * Run this to test if the stored procedure update was successful
 */

import { pool } from './config/database.js';
import Logger from './utils/logger.js';

const logger = new Logger('DB-VERIFY');

async function verifyStoredProcedure() {
  try {
    logger.info('Verifying stored procedure parameters...');
    
    // Test data
    const testData = {
      reporter_name: 'Test Reporter',
      reporter_contact: '1234567890',
      title: 'Test Incident',
      description: 'Test Description',
      location: 'Test Location',
      latitude: 14.5995,
      longitude: 120.9842,
      incident_date: new Date(),
      status: 'pending',
      images: JSON.stringify(['test.jpg']),
      assigned_catcher_id: null,
      incident_type: 'stray',
      pet_color: 'Brown',
      pet_breed: 'Mixed',
      animal_type: 'dog',
      pet_gender: 'male',
      pet_size: 'medium'
    };

    logger.info('Testing sp_incidents_create with 17 parameters (no priority)...');
    
    const [result] = await pool.execute(
      'CALL sp_incidents_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        testData.reporter_name,
        testData.reporter_contact,
        testData.title,
        testData.description,
        testData.location,
        testData.latitude,
        testData.longitude,
        testData.incident_date,
        testData.status,
        testData.images,
        testData.assigned_catcher_id,
        testData.incident_type,
        testData.pet_color,
        testData.pet_breed,
        testData.animal_type,
        testData.pet_gender,
        testData.pet_size
      ]
    );

    const insertedId = result[0][0].id;
    logger.success(`Test incident created successfully! ID: ${insertedId}`);

    // Clean up test data
    await pool.execute('DELETE FROM incidents WHERE id = ?', [insertedId]);
    logger.info('Test data cleaned up');

    logger.success('✅ DATABASE IS CORRECTLY CONFIGURED!');
    logger.success('✅ Stored procedures are working with 17 parameters (no priority)');
    logger.success('✅ incident_type field is working correctly');
    logger.success('✅ Your incident report submission should now work!');
    
  } catch (error) {
    logger.error('❌ VERIFICATION FAILED!', error);
    logger.error('Error details:', error.message);
    
    if (error.message.includes('Incorrect number of arguments')) {
      logger.error('');
      logger.error('⚠️  PROBLEM: Stored procedure has wrong number of parameters');
      logger.error('⚠️  SOLUTION: Run FIX_DATABASE_NOW.sql in MySQL Workbench');
      logger.error('');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyStoredProcedure();
