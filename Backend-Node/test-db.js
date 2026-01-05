import { pool } from './config/database.js';

async function testDatabase() {
  try {
    console.log('Testing database connection...\n');
    
    // Check users
    const [users] = await pool.query('SELECT id, username, email, role FROM users');
    console.log('Users in database:', users.length);
    console.log(users);
    
    // Create test user if none exist
    if (users.length === 0) {
      console.log('\nCreating test users...');
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@cityvetcare.com', hashedPassword, 'admin']
      );
      
      const hashedUserPassword = await bcrypt.hash('user123', 10);
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['testuser', 'user@cityvetcare.com', hashedUserPassword, 'citizen']
      );
      
      console.log('\n✅ Test users created!');
      console.log('👤 Admin - username: admin, password: admin123');
      console.log('👤 User - username: testuser, password: user123');
    } else {
      console.log('\n✅ Test users exist. Use existing credentials:');
      console.log('👤 Admin - username: admin, password: admin123');
      console.log('👤 User - username: testuser, password: user123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDatabase();
