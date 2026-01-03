import bcrypt from 'bcrypt';
import { query } from './config/database.js';

async function createTestUser() {
  try {
    const testUsers = [
      { username: 'testuser', email: 'test@test.com', password: 'test123', role: 'user' },
      { username: 'catcher1', email: 'catcher@test.com', password: 'test123', role: 'catcher' },
      { username: 'vet1', email: 'vet@test.com', password: 'test123', role: 'veterinarian' }
    ];

    console.log('Creating test users...\n');

    for (const user of testUsers) {
      // Check if user already exists
      const existing = await query('SELECT id FROM users WHERE username = ?', [user.username]);
      
      if (existing && existing.length > 0) {
        console.log(`⚠️  User '${user.username}' already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10);

      // Insert user
      await query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.username, user.email, passwordHash, user.role]
      );

      console.log(`✅ Created user: ${user.username} (${user.role}) - password: ${user.password}`);
    }

    console.log('\n✅ Test users created successfully!');
    console.log('\nYou can now login with:');
    console.log('- Username: testuser, Password: test123');
    console.log('- Username: catcher1, Password: test123');
    console.log('- Username: vet1, Password: test123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUser();
