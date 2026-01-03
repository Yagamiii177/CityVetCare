import { pool } from './Backend-Node/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration(filename) {
  try {
    console.log(`\n🔄 Running migration: ${filename}`);
    
    const migrationPath = path.join(__dirname, 'Database', 'migrations', filename);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));
    
    for (const statement of statements) {
      if (statement.includes('DELIMITER')) continue;
      if (statement.includes('//')) continue;
      
      try {
        await pool.query(statement);
      } catch (err) {
        // Ignore "duplicate column" errors as it means the column already exists
        if (!err.message.includes('Duplicate column name')) {
          throw err;
        } else {
          console.log(`   ℹ️  Column already exists, skipping...`);
        }
      }
    }
    
    console.log(`✅ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migrations for mobile report fields...\n');
  
  const migrations = [
    'add_mobile_report_fields.sql',
    'update_stored_procedures_mobile_fields.sql',
    'clear_old_incidents_data.sql'
  ];
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.error('\n❌ Migration failed. Stopping...');
      process.exit(1);
    }
  }
  
  console.log('\n✅ All migrations completed successfully!');
  console.log('\n📋 Database is ready for new mobile-structured reports!');
  await pool.end();
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
