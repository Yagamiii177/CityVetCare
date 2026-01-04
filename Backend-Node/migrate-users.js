import { pool } from './config/database.js';

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔧 Updating users table...');
    
    // Add columns if they don't exist
    const migrations = [
      "ALTER TABLE users ADD COLUMN full_name VARCHAR(100)",
      "ALTER TABLE users ADD COLUMN contact_number VARCHAR(20)",
      "ALTER TABLE users ADD COLUMN address TEXT",
      "ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'",
      "ALTER TABLE users CHANGE COLUMN password_hash password VARCHAR(255) NOT NULL"
    ];
    
    for (const sql of migrations) {
      try {
        await connection.query(sql);
        console.log(`✅ ${sql.substring(0, 50)}...`);
      } catch (error) {
        if (error.message.includes('Duplicate column') || error.message.includes("already exists")) {
          console.log(`⏭️  Column already exists, skipping`);
        } else if (error.message.includes("Can't DROP")) {
          console.log(`⏭️  Column rename not needed, skipping`);
        } else {
          console.warn(`⚠️  Warning: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Migration completed!');
    
  } finally {
    connection.release();
    await pool.end();
  }
}

migrate();
