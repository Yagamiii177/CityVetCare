import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cityvetcare_db',
  multipleStatements: true
};

async function runMigration(filename) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log(`\n🔄 Running migration: ${filename}`);
    
    const migrationPath = path.join(__dirname, filename);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const [results] = await connection.query(sqlContent);
    
    console.log(`✅ Migration completed: ${filename}`);
    if (Array.isArray(results) && results.length > 0) {
      const lastResult = results[results.length - 1];
      if (lastResult && lastResult[0]) {
        console.log('   ', lastResult[0]);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error.message);
    return false;
  } finally {
    await connection.end();
  }
}

async function main() {
  console.log('🚀 Starting database migrations for mobile report fields...\n');
  
  const migrations = [
    'add_mobile_report_fields.sql',
    'update_stored_procedures_mobile_fields.sql'
  ];
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.error('\n❌ Migration failed. Stopping...');
      process.exit(1);
    }
  }
  
  console.log('\n✅ All migrations completed successfully!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
