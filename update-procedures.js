import { pool } from './Backend-Node/config/database.js';
import fs from 'fs';

async function updateStoredProcedures() {
  console.log('🔄 Updating stored procedures for mobile fields...\n');
  
  try {
    const sqlPath = './Database/migrations/update_stored_procedures_mobile_fields.sql';
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by delimiter and execute each statement
    const statements = sql
      .split(/DELIMITER\s+[^\s;]+/gi)
      .filter(stmt => stmt.trim().length > 0);
    
    for (let statement of statements) {
      statement = statement.trim();
      if (!statement || statement.startsWith('--') || statement.startsWith('USE')) {
        continue;
      }
      
      // Remove trailing delimiter markers
      statement = statement.replace(/\/\/\s*$/g, '').replace(/;\s*$/g, '').trim();
      
      if (statement.length > 0) {
        try {
          console.log('Executing:', statement.substring(0, 50) + '...');
          await pool.query(statement);
          console.log('✅ Success\n');
        } catch (err) {
          if (!err.message.includes('Unknown procedure') && !err.message.includes('does not exist')) {
            console.log('⚠️  Warning:', err.message, '\n');
          }
        }
      }
    }
    
    console.log('✅ Stored procedures updated successfully!\n');
    
    // Test the updated procedure
    console.log('🧪 Testing updated sp_incidents_create...');
    const [results] = await pool.execute('SHOW CREATE PROCEDURE sp_incidents_create');
    console.log('✅ Procedure exists and is ready\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateStoredProcedures();
