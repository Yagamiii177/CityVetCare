import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  let connection;

  try {
    console.log('🔄 Starting database migrations...\n');

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cityvetcare_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database:', process.env.DB_NAME || 'cityvetcare_db');
    console.log('━'.repeat(60));

    // Get all SQL files in migrations directory
    const migrationFiles = [
      '001_stored_procedures.sql',
      '002_complete_crud_procedures.sql'
    ];

    for (const filename of migrationFiles) {
      const filePath = path.join(__dirname, filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${filename} - file not found`);
        continue;
      }

      console.log(`\n📄 Running migration: ${filename}`);
      console.log('─'.repeat(60));

      // Read the SQL file
      let sqlContent = fs.readFileSync(filePath, 'utf8');

      // Split by DELIMITER statements and process each procedure
      const delimiterRegex = /DELIMITER\s+(\$\$|;)/gi;
      let currentDelimiter = ';';
      const statements = [];
      let currentStatement = '';

      sqlContent.split('\n').forEach(line => {
        const delimiterMatch = line.match(delimiterRegex);
        
        if (delimiterMatch) {
          // Change delimiter
          currentDelimiter = delimiterMatch[0].split(/\s+/)[1];
          return;
        }

        currentStatement += line + '\n';

        // Check if statement is complete
        if (currentDelimiter === '$$') {
          if (line.trim().endsWith('$$')) {
            statements.push(currentStatement.replace(/\$\$\s*$/, '').trim());
            currentStatement = '';
          }
        } else if (currentDelimiter === ';') {
          if (line.trim().endsWith(';') && !line.trim().startsWith('--')) {
            statements.push(currentStatement.trim());
            currentStatement = '';
          }
        }
      });

      // Add any remaining statement
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }

      // Execute each statement
      let procedureCount = 0;
      for (const statement of statements) {
        const cleanStatement = statement
          .replace(/--.*$/gm, '') // Remove comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
          .trim();

        if (!cleanStatement || cleanStatement.length < 10) continue;

        // Check if it's a CREATE PROCEDURE or DROP PROCEDURE statement
        if (cleanStatement.match(/CREATE\s+PROCEDURE/i)) {
          const procNameMatch = cleanStatement.match(/CREATE\s+PROCEDURE\s+(\w+)/i);
          const procName = procNameMatch ? procNameMatch[1] : 'unknown';
          
          try {
            await connection.query(cleanStatement);
            console.log(`  ✓ Created procedure: ${procName}`);
            procedureCount++;
          } catch (error) {
            if (error.code === 'ER_SP_ALREADY_EXISTS') {
              console.log(`  ℹ Procedure ${procName} already exists (skipped)`);
            } else {
              console.error(`  ✗ Error creating ${procName}:`, error.message);
            }
          }
        } else if (cleanStatement.match(/DROP\s+PROCEDURE/i)) {
          const procNameMatch = cleanStatement.match(/DROP\s+PROCEDURE\s+IF\s+EXISTS\s+(\w+)/i);
          const procName = procNameMatch ? procNameMatch[1] : 'unknown';
          
          try {
            await connection.query(cleanStatement);
            console.log(`  ✓ Dropped procedure: ${procName}`);
          } catch (error) {
            if (error.code !== 'ER_SP_DOES_NOT_EXIST') {
              console.error(`  ⚠ Error dropping ${procName}:`, error.message);
            }
          }
        } else if (cleanStatement.match(/USE\s+/i)) {
          // Execute USE statement
          try {
            await connection.query(cleanStatement);
          } catch (error) {
            console.error(`  ✗ Error executing USE:`, error.message);
          }
        }
      }

      console.log(`\n  📊 Total procedures processed: ${procedureCount}`);
    }

    console.log('\n' + '━'.repeat(60));
    console.log('✅ All migrations completed successfully!');
    console.log('━'.repeat(60));

    // Test a stored procedure
    console.log('\n🧪 Testing stored procedures...');
    try {
      const [results] = await connection.execute('CALL sp_incidents_count_by_status()');
      console.log('✅ Test successful! Incident count by status:');
      console.table(results[0]);
    } catch (error) {
      console.error('⚠️  Test failed:', error.message);
    }

  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run migrations
runMigrations();
