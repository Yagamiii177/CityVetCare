// Fix the sp_incidents_update stored procedure
const mysql = require('mysql2/promise');
const fs = require('fs');

async function fixStoredProcedure() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cityvetcare_db',
      multipleStatements: true
    });

    console.log('✓ Connected to database');

    // Read and execute the SQL fix
    const sql = fs.readFileSync('./fix-update-procedure.sql', 'utf8');
    
    console.log('🔧 Fixing sp_incidents_update procedure...');
    await connection.query(sql);
    
    console.log('✅ Stored procedure fixed successfully!');
    console.log('');
    console.log('The sp_incidents_update procedure now has:');
    console.log('  - All mobile report fields (incident_type, pet_color, etc.)');
    console.log('  - Correct WHERE clause using "id" column');
    console.log('');
    console.log('You can now approve/reject reports without errors!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixStoredProcedure();
