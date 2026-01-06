import { pool } from './config/database.js';

async function fixTables() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Checking table structures...\n');
    
    // Check catcher_teams columns
    const [columns] = await connection.query('SHOW COLUMNS FROM catcher_teams');
    console.log('catcher_teams columns:', columns.map(c => c.Field).join(', '));
    
    // Add members_count if missing
    const hasMembers = columns.some(c => c.Field === 'members_count');
    if (!hasMembers) {
      console.log('\n✅ Adding members_count column...');
      await connection.query('ALTER TABLE catcher_teams ADD COLUMN members_count INT DEFAULT 1 AFTER status');
      console.log('✅ Column added');
    }
    
    // Check schedules columns
    const [schedCols] = await connection.query('SHOW COLUMNS FROM schedules');
    console.log('\nschedules columns:', schedCols.map(c => c.Field).join(', '));
    
    // Add end_time if missing
    const hasEndTime = schedCols.some(c => c.Field === 'end_time');
    if (!hasEndTime) {
      console.log('\n✅ Adding end_time column...');
      await connection.query('ALTER TABLE schedules ADD COLUMN end_time TIME AFTER scheduled_time');
      console.log('✅ Column added');
    }
    
    console.log('\n✅ All tables fixed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    await pool.end();
  }
}

fixTables();
