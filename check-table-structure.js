import { pool } from './Backend-Node/config/database.js';

async function checkTableStructure() {
  console.log('🔍 Checking incidents table structure...\n');
  
  try {
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM incidents
    `);
    
    console.log('Current columns in incidents table:');
    console.log('═'.repeat(60));
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('═'.repeat(60));
    
    // Check for mobile fields
    const mobileFields = ['incident_type', 'pet_color', 'pet_breed', 'animal_type', 'pet_gender', 'pet_size'];
    const existingFields = columns.map(c => c.Field);
    
    console.log('\n📱 Mobile Report Fields Status:');
    mobileFields.forEach(field => {
      const exists = existingFields.includes(field);
      console.log(`  ${exists ? '✅' : '❌'} ${field}`);
    });
    
    const missingFields = mobileFields.filter(f => !existingFields.includes(f));
    
    if (missingFields.length > 0) {
      console.log(`\n⚠️  Missing ${missingFields.length} mobile fields!`);
      console.log(`   Run: node run-mobile-migrations.js`);
    } else {
      console.log('\n✅ All mobile fields are present!');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkTableStructure();
