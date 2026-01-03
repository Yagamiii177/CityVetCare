import { pool } from './Backend-Node/config/database.js';

async function addMobileFields() {
  console.log('🔧 Adding mobile report fields to incidents table...\n');
  
  const alterStatements = [
    "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS pet_color VARCHAR(100) COMMENT 'Color of the pet/animal'",
    "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS pet_breed VARCHAR(100) COMMENT 'Breed of the pet/animal'",
    "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS animal_type VARCHAR(50) COMMENT 'Type of animal (dog, cat, etc.)'",
    "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS pet_gender ENUM('male', 'female', 'unknown') DEFAULT NULL COMMENT 'Gender of the pet/animal'",
    "ALTER TABLE incidents ADD COLUMN IF NOT EXISTS pet_size ENUM('small', 'medium', 'large', 'extra_large') DEFAULT NULL COMMENT 'Size of the pet/animal'"
  ];
  
  try {
    for (const statement of alterStatements) {
      const field = statement.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
      console.log(`Adding column: ${field}...`);
      try {
        await pool.query(statement);
        console.log(`✅ ${field} added successfully`);
      } catch (err) {
        if (err.message.includes('Duplicate column name')) {
          console.log(`ℹ️  ${field} already exists`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('\n✅ All mobile fields added successfully!\n');
    
    // Verify
    const [columns] = await pool.execute('SHOW COLUMNS FROM incidents');
    const fieldNames = columns.map(c => c.Field);
    
    console.log('📋 Verification:');
    ['pet_color', 'pet_breed', 'animal_type', 'pet_gender', 'pet_size'].forEach(field => {
      console.log(`  ${fieldNames.includes(field) ? '✅' : '❌'} ${field}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addMobileFields();
