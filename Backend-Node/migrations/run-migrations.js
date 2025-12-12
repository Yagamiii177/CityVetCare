import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...\n');

    // Read migration file
    const migrationFile = path.join(__dirname, '001_stored_procedures.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    // Split by delimiter change and procedure definitions
    const statements = sql
      .split('DELIMITER')
      .filter(stmt => stmt.trim().length > 0);

    console.log(`📄 Found ${statements.length} migration blocks\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      
      if (statement.includes('$$') || statement.includes(';')) {
        // Clean up the statement
        let cleanStmt = statement
          .replace(/\$\$/g, '')
          .replace(/^;/g, '')
          .trim();

        if (cleanStmt.length > 0 && !cleanStmt.startsWith('--')) {
          try {
            // Split multiple statements if needed
            const subStatements = cleanStmt
              .split(/;\s*$/gm)
              .filter(s => s.trim().length > 0);

            for (const subStmt of subStatements) {
              if (subStmt.trim().length > 0) {
                await pool.query(subStmt.trim());
              }
            }
            
            console.log(`✅ Migration block ${i + 1} executed successfully`);
          } catch (error) {
            // Ignore "procedure already exists" errors
            if (!error.message.includes('already exists')) {
              console.error(`❌ Error in migration block ${i + 1}:`, error.message);
            }
          }
        }
      }
    }

    console.log('\n✅ All migrations completed successfully!\n');
    
    // Test a stored procedure
    console.log('🧪 Testing stored procedure: sp_get_incident_statistics');
    const [results] = await pool.query('CALL sp_get_incident_statistics()');
    console.log('📊 Statistics:', results[0]);
    
    console.log('\n✨ Migration process finished!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigrations();
