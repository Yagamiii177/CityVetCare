import { pool } from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================');
console.log('  CityVetCare Database Initialization');
console.log('========================================\n');

async function initializeDatabase() {
  let connection;
  
  try {
    // Get connection
    connection = await pool.getConnection();
    console.log('✅ Connected to MySQL server\n');

    // Read and execute schema
    console.log('📋 Reading database schema...');
    const schemaPath = path.join(__dirname, '..', 'Database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove comments
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split by semicolons
    const statements = cleanedSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        await connection.query(statement);
        
        // Log progress for important statements
        if (statement.includes('CREATE DATABASE')) {
          console.log('✅ Database created/verified');
        } else if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE.*?`?(\w+)`?/i)?.[1];
          console.log(`✅ Table created: ${tableName}`);
        } else if (statement.includes('INSERT INTO')) {
          const tableName = statement.match(/INSERT INTO\s+`?(\w+)`?/i)?.[1];
          console.log(`✅ Sample data inserted into: ${tableName}`);
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && 
            !error.message.includes('Duplicate entry')) {
          console.error(`⚠️  Error: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log('\n📊 Creating admin user with bcrypt hash...');
    
    // Create admin user with proper bcrypt hash
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    try {
      await connection.query(
        `INSERT INTO users (username, email, password, full_name, contact_number, address, role, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin', 'admin@cityvetcare.com', hashedPassword, 'System Administrator', '09171234567', 'City Hall', 'admin', 'active']
      );
      console.log('✅ Admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } catch (error) {
      if (error.message.includes('Duplicate entry')) {
        console.log('ℹ️  Admin user already exists');
      } else {
        throw error;
      }
    }

    // Run stored procedures
    console.log('\n📝 Running stored procedure migrations...');
    const proceduresPath = path.join(__dirname, 'migrations', '002_complete_crud_procedures.sql');
    
    if (fs.existsSync(proceduresPath)) {
      const procedures = fs.readFileSync(proceduresPath, 'utf8');
      
      // Execute stored procedures (they use DELIMITER)
      const procStatements = procedures
        .split('$$')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'DELIMITER');

      for (const statement of procStatements) {
        if (statement.includes('DROP PROCEDURE') || statement.includes('CREATE PROCEDURE')) {
          try {
            await connection.query(statement);
          } catch (error) {
            // Ignore "doesn't exist" errors for DROP
            if (!error.message.includes("doesn't exist")) {
              console.error(`⚠️  Procedure error: ${error.message.substring(0, 100)}`);
            }
          }
        }
      }
      console.log('✅ Stored procedures created');
    }

    console.log('\n========================================');
    console.log('✅ Database initialization complete!');
    console.log('========================================\n');
    
    console.log('🎯 Next Steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Test the API: http://localhost:3000');
    console.log('3. Login with: admin / admin123\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

initializeDatabase();
