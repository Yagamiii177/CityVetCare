import mysql from 'mysql2/promise';

async function addPriorityColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cityvetcare_db'
  });

  try {
    console.log('Adding priority column...');
    await connection.query(`
      ALTER TABLE incidents 
      ADD COLUMN IF NOT EXISTS priority ENUM('low', 'medium', 'high') DEFAULT 'medium' 
      AFTER status
    `);
    console.log('✅ Priority column added successfully');
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('ℹ️  Priority column already exists');
    } else {
      throw error;
    }
  } finally {
    await connection.end();
  }
}

addPriorityColumn();
