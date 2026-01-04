/**
 * Run Database Migration
 * This script applies the authentication fields migration to the users table
 */

import { pool } from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔧 Starting database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'Database', 'migrations', 'add_auth_fields_to_users.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons to execute each statement separately
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement && statement.length > 10) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await connection.query(statement);
        } catch (error) {
          // Ignore errors for IF NOT EXISTS and other conditional statements
          if (!error.message.includes('Duplicate column') && 
              !error.message.includes('already exists')) {
            console.warn(`Warning on statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    // Verify the migration
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cityvetcare_db' 
      AND TABLE_NAME = 'users'
    `);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nUsers table columns:');
    columns.forEach(col => console.log(`  - ${col.COLUMN_NAME}`));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
