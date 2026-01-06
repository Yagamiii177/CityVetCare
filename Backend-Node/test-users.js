import { query } from './config/database.js';

async function testUsers() {
  try {
    console.log('Checking for users in database...\n');
    
    const users = await query('SELECT id, username, email, role, created_at FROM users LIMIT 5');
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\nTo create a test user, use the register endpoint:');
      console.log('POST http://localhost:3000/api/auth/register');
      console.log('Body: { "username": "testuser", "email": "test@test.com", "password": "test123", "role": "user" }');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Created: ${user.created_at}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

testUsers();
