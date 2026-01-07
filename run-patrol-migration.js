// Run database migration to fix patrol_schedule.assigned_catcher_id column type
import pool from './Backend-Node/config/database.js';
import fs from 'fs';

async function runMigration() {
  try {
    console.log('🔧 Running patrol schedule migration...\n');
    
    // Execute migration statements one by one
    console.log('Step 1: Dropping foreign key constraint...');
    await pool.execute('ALTER TABLE patrol_schedule DROP FOREIGN KEY fk_schedule_catcher');
    console.log('✓ Foreign key dropped\n');
    
    console.log('Step 2: Changing column type to VARCHAR(255)...');
    await pool.execute(`ALTER TABLE patrol_schedule 
      MODIFY COLUMN assigned_catcher_id VARCHAR(255) NOT NULL 
      COMMENT 'Comma-separated catcher IDs for team patrols'`);
    console.log('✓ Column type changed\n');
    
    console.log('Step 3: Adding index for performance...');
    await pool.execute('ALTER TABLE patrol_schedule ADD INDEX idx_assigned_catchers (assigned_catcher_id(50))');
    console.log('✓ Index added\n');
    
    // Verify the change
    const [rows] = await pool.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'cityvetcare_db'
        AND TABLE_NAME = 'patrol_schedule'
        AND COLUMN_NAME = 'assigned_catcher_id'
    `);
    
    console.log('📊 Verification:');
    console.log(rows[0]);
    
    if (rows[0].DATA_TYPE === 'varchar') {
      console.log('\n✅ Migration complete: assigned_catcher_id is now VARCHAR(255)');
    } else {
      console.log('\n❌ Migration failed: Column is still ' + rows[0].DATA_TYPE);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
