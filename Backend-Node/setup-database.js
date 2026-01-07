import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🔧 Setting up CityVetCare Database...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
  });

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'Database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Applying schema...');
    await connection.query(schema);
    
    console.log('✅ Database setup complete!\n');
    console.log('📊 Tables created:');
    console.log('   - incidents');
    console.log('   - catcher_teams');
    console.log('   - schedules');
    console.log('   - administrator');
    console.log('   - pet_owner');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupDatabase();
