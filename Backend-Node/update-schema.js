import pool from './config/database.js';
import Logger from './utils/logger.js';

const logger = new Logger('SCHEMA-UPDATE');

async function updateSchema() {
  try {
    logger.info('Starting schema update...');
    
    // Check if priority column exists
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM incident_report LIKE 'priority'
    `);
    
    if (columns.length === 0) {
      logger.info('Adding priority column to incident_report table...');
      await pool.execute(`
        ALTER TABLE incident_report 
        ADD COLUMN priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' 
        AFTER status
      `);
      logger.info('✅ Priority column added successfully');
    } else {
      logger.info('✅ Priority column already exists');
    }
    
    // Update status ENUM to include all statuses
    logger.info('Updating status ENUM values...');
    try {
      await pool.execute(`
        ALTER TABLE incident_report 
        MODIFY COLUMN status ENUM('Pending', 'Verified', 'Scheduled', 'In Progress', 'Resolved', 'Rejected', 'Cancelled') DEFAULT 'Pending'
      `);
      logger.info('✅ Status column updated successfully');
    } catch (err) {
      if (err.message.includes('Duplicate')) {
        logger.info('✅ Status column already has correct values');
      } else {
        throw err;
      }
    }
    
    // Create indexes for performance
    logger.info('Creating/checking indexes...');
    try {
      await pool.execute(`
        CREATE INDEX IF NOT EXISTS idx_priority ON incident_report(priority)
      `);
      logger.info('✅ Priority index created');
    } catch (err) {
      if (!err.message.includes('Duplicate')) {
        throw err;
      }
    }
    
    logger.info('✅ Schema update completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Schema update failed:', error);
    process.exit(1);
  }
}

updateSchema();
