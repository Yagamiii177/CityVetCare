import bcrypt from 'bcrypt';
import { pool } from './config/database.js';

async function testLogin() {
  try {
    // Get admin user
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    const user = users[0];
    console.log('User found:', { id: user.id, username: user.username, role: user.role });
    console.log('Password hash:', user.password_hash);
    
    // Test password
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log(`\nPassword "${testPassword}" is valid:`, isValid);
    
    if (!isValid) {
      console.log('\n⚠️ Password does not match! Updating password...');
      const newHash = await bcrypt.hash(testPassword, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
      console.log('✅ Password updated successfully');
    } else {
      console.log('✅ Password is correct');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testLogin();
