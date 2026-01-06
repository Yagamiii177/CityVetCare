const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Running Dashboard Stats Fix Migration...\n');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cityvetcare_db',
      multipleStatements: true
    });

    console.log('✓ Connected to database');

    // Read and execute migration
    const fs = require('fs');
    const path = require('path');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'Database', 'migrations', 'fix_dashboard_verified_field.sql'),
      'utf8'
    );

    await connection.query(migrationSQL);
    console.log('✓ Migration executed successfully');

    // Test the stored procedure
    const [results] = await connection.query('CALL sp_dashboard_get_stats()');
    const stats = results[0][0];
    
    console.log('\n📊 Dashboard Stats:');
    console.log(`   Total Incidents: ${stats.total_incidents}`);
    console.log(`   Pending: ${stats.pending_incidents}`);
    console.log(`   Approved: ${stats.approved_incidents}`);
    console.log(`   Verified: ${stats.verified_incidents}`);
    console.log(`   In Progress: ${stats.in_progress_incidents}`);
    console.log(`   Resolved: ${stats.resolved_incidents}`);
    console.log(`   Rejected: ${stats.rejected_incidents}`);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
