import mysql from './Backend-Node/node_modules/mysql2/promise.js';
import dotenv from './Backend-Node/node_modules/dotenv/lib/main.js';

dotenv.config({ path: './Backend-Node/.env' });

async function testConnection() {
  console.log('🔍 Testing Backend Database Connection...\n');
  
  console.log('Database Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || '127.0.0.1'}`);
  console.log(`  Port: ${process.env.DB_PORT || 3306}`);
  console.log(`  User: ${process.env.DB_USER || 'root'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'cityvetcare_db'}\n`);
  
  try {
    console.log('📡 Attempting to connect...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cityvetcare_db',
    });
    
    console.log('✅ Database connected successfully!\n');
    
    // Test query
    console.log('🔍 Testing database query...');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM incidents');
    console.log(`✅ Found ${rows[0].count} incidents in database\n`);
    
    // Check if stored procedures exist
    console.log('🔍 Checking stored procedures...');
    const [procedures] = await connection.execute(`
      SELECT ROUTINE_NAME 
      FROM information_schema.ROUTINES 
      WHERE ROUTINE_SCHEMA = '${process.env.DB_NAME || 'cityvetcare_db'}' 
      AND ROUTINE_TYPE = 'PROCEDURE'
      AND ROUTINE_NAME LIKE 'sp_incidents%'
    `);
    
    if (procedures.length > 0) {
      console.log('✅ Found stored procedures:');
      procedures.forEach(proc => console.log(`   - ${proc.ROUTINE_NAME}`));
    } else {
      console.log('⚠️  No incident stored procedures found!');
      console.log('   Run: node Backend-Node/migrations/run-all-migrations.js');
    }
    
    console.log('\n🎉 Backend connection test completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Is MySQL/XAMPP running?');
    console.error('   2. Does the database "cityvetcare_db" exist?');
    console.error('   3. Are the credentials in Backend-Node/.env correct?');
    console.error('   4. Is MySQL listening on port 3306?\n');
    process.exit(1);
  }
}

testConnection();
