/**
 * Create a test pet owner with properly hashed bcrypt password
 */
import bcrypt from 'bcrypt';
import { pool } from './config/database.js';
import Logger from './utils/logger.js';

const logger = new Logger('CREATE_TEST_OWNER');

async function createTestOwner() {
  try {
    const testEmail = 'test@owner.com';
    const testPassword = 'testpass123';
    
    // Check if test owner exists
    const [existing] = await pool.query(
      'SELECT owner_id, email FROM pet_owner WHERE email = ?',
      [testEmail]
    );
    
    if (existing.length > 0) {
      console.log('✅ Test owner already exists');
      console.log('   Owner ID:', existing[0].owner_id);
      console.log('   Email:', existing[0].email);
      console.log('   Password:', testPassword);
      return existing[0];
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Create test owner
    const [result] = await pool.query(
      `INSERT INTO pet_owner (full_name, email, password, contact_number, address) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Test Owner', testEmail, hashedPassword, '09123456789', '123 Test Street']
    );
    
    console.log('✅ Test owner created successfully');
    console.log('   Owner ID:', result.insertId);
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    console.log('   Hashed Password:', hashedPassword);
    
    return { owner_id: result.insertId, email: testEmail };
    
  } catch (error) {
    console.error('❌ Failed to create test owner:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

createTestOwner();
