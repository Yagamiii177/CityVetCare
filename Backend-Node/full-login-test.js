import bcrypt from 'bcrypt';
import { pool } from './config/database.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function fullLoginTest() {
  try {
    console.log('=== FULL LOGIN TEST ===\n');
    
    // Step 1: Get user from database
    console.log('1. Fetching user from database...');
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    const user = users[0];
    console.log('✅ User found:', user.username);
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Has password_hash:', !!user.password_hash);
    
    // Step 2: Verify password
    console.log('\n2. Verifying password...');
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log('   Password "' + testPassword + '" is valid:', isValid);
    
    if (!isValid) {
      console.log('❌ Password does not match');
      process.exit(1);
    }
    
    // Step 3: Generate tokens
    console.log('\n3. Generating JWT tokens...');
    console.log('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('   JWT_REFRESH_SECRET exists:', !!process.env.JWT_REFRESH_SECRET);
    
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Tokens generated successfully');
    console.log('   Access Token:', accessToken.substring(0, 30) + '...');
    console.log('   Refresh Token:', refreshToken.substring(0, 30) + '...');
    
    // Step 4: Create response object
    console.log('\n4. Creating response...');
    const response = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    };
    
    console.log('✅ Response object created');
    console.log('\n=== TEST COMPLETE ===');
    console.log('\n📝 Login should work with:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

fullLoginTest();
