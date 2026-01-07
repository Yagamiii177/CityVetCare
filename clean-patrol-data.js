// Clean patrol schedule data while keeping dog catcher records
import pool from './Backend-Node/config/database.js';

async function cleanPatrolData() {
  try {
    console.log('🧹 Cleaning patrol schedule data...\n');
    
    // Show counts before deletion
    console.log('📊 BEFORE CLEANUP:');
    const [beforeCounts] = await pool.execute(`
      SELECT 'Patrol Schedules' AS table_name, COUNT(*) AS record_count FROM patrol_schedule
      UNION ALL
      SELECT 'Dog Catchers' AS table_name, COUNT(*) AS record_count FROM dog_catcher
    `);
    console.table(beforeCounts);
    
    // Delete all patrol schedule records
    console.log('\n🗑️  Deleting all patrol schedule records...');
    const [deleteResult] = await pool.execute('DELETE FROM patrol_schedule');
    console.log(`✓ Deleted ${deleteResult.affectedRows} patrol schedule record(s)\n`);
    
    // Reset auto-increment
    console.log('🔄 Resetting auto-increment counter...');
    await pool.execute('ALTER TABLE patrol_schedule AUTO_INCREMENT = 1');
    console.log('✓ Auto-increment reset\n');
    
    // Show counts after deletion
    console.log('📊 AFTER CLEANUP:');
    const [afterCounts] = await pool.execute(`
      SELECT 'Patrol Schedules' AS table_name, COUNT(*) AS record_count FROM patrol_schedule
      UNION ALL
      SELECT 'Dog Catchers' AS table_name, COUNT(*) AS record_count FROM dog_catcher
    `);
    console.table(afterCounts);
    
    // Verify dog_catcher data is intact
    console.log('\n👥 Dog Catcher Records (preserved):');
    const [catchers] = await pool.execute(`
      SELECT 
        catcher_id,
        full_name,
        contact_number
      FROM dog_catcher
      ORDER BY catcher_id
    `);
    console.table(catchers);
    
    console.log('\n✅ Cleanup complete!');
    console.log('   ✓ All patrol schedules deleted');
    console.log('   ✓ Dog catcher data preserved');
    console.log(`   ✓ ${catchers.length} animal catcher(s) still in database`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

cleanPatrolData();
