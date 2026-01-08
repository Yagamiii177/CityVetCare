/**
 * Run the owner_id migration that was missing
 */
import { pool } from './config/database.js';
import Logger from './utils/logger.js';

const logger = new Logger('MIGRATION');

async function runMigration() {
  try {
    console.log('\n🔧 Running owner_id migration...\n');
    
    // Check if column already exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cityvetcare_db' 
        AND TABLE_NAME = 'incident_report' 
        AND COLUMN_NAME = 'owner_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ owner_id column already exists - no migration needed');
      return;
    }
    
    console.log('📝 Adding owner_id column to incident_report table...');
    
    // Add owner_id column
    await pool.query(`
      ALTER TABLE incident_report 
      ADD COLUMN owner_id INT NULL AFTER reporter_id
    `);
    console.log('✅ Column added');
    
    // Add foreign key constraint
    console.log('📝 Adding foreign key constraint...');
    await pool.query(`
      ALTER TABLE incident_report 
      ADD CONSTRAINT fk_incident_owner 
        FOREIGN KEY (owner_id) REFERENCES pet_owner(owner_id) 
        ON DELETE SET NULL
    `);
    console.log('✅ Foreign key constraint added');
    
    // Add index
    console.log('📝 Adding index...');
    await pool.query(`
      ALTER TABLE incident_report 
      ADD INDEX idx_owner_id (owner_id)
    `);
    console.log('✅ Index added');
    
    // Add comment
    console.log('📝 Adding column comment...');
    await pool.query(`
      ALTER TABLE incident_report 
      MODIFY COLUMN owner_id INT NULL 
      COMMENT 'Pet owner who submitted the report (NULL for anonymous emergency reports)'
    `);
    console.log('✅ Comment added');
    
    console.log('\n✅ Migration completed successfully!\n');
    
    // Verify
    const [verify] = await pool.query(`
      SHOW COLUMNS FROM incident_report LIKE 'owner_id'
    `);
    console.log('Verification:', verify[0]);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
