import { testConnection, query } from './config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

console.log('🔍 COMPREHENSIVE BACKEND & DATABASE TEST');
console.log('========================================\n');

const issues = [];
const warnings = [];

// Test 1: Database Connection
async function testDatabaseConnection() {
  console.log('📡 Test 1: Database Connection');
  try {
    await testConnection();
    console.log('✅ Database connection successful\n');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    issues.push('Database connection failed');
    return false;
  }
}

// Test 2: Check Required Tables
async function testDatabaseTables() {
  console.log('📋 Test 2: Database Tables');
  const requiredTables = [
    'users',
    'incidents',
    'catcher_teams',
    'patrol_staff',
    'patrol_schedules',
    'notifications',
    'audit_logs',
    'refresh_tokens'
  ];

  try {
    const tables = await query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log(`Found ${tableNames.length} tables:`, tableNames.join(', '));
    
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    if (missingTables.length > 0) {
      console.warn('⚠️  Missing tables:', missingTables.join(', '));
      warnings.push(`Missing tables: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ All required tables exist\n');
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to check tables:', error.message);
    issues.push('Failed to check tables');
    return false;
  }
}

// Test 3: Check Users Table Structure
async function testUsersTable() {
  console.log('👤 Test 3: Users Table Structure');
  try {
    const columns = await query('DESCRIBE users');
    const columnNames = columns.map(c => c.Field);
    
    const requiredColumns = ['id', 'username', 'email', 'password_hash', 'role'];
    const missingColumns = requiredColumns.filter(c => !columnNames.includes(c));
    
    if (missingColumns.length > 0) {
      console.error('❌ Missing columns:', missingColumns.join(', '));
      issues.push(`Users table missing columns: ${missingColumns.join(', ')}`);
      return false;
    }
    
    // Check role enum values
    const roleColumn = columns.find(c => c.Field === 'role');
    if (roleColumn) {
      const roleValues = roleColumn.Type.match(/enum\((.*)\)/)[1];
      console.log('   Role values:', roleValues);
      
      if (!roleValues.includes('veterinarian')) {
        console.error('❌ Missing veterinarian role');
        issues.push('Users table missing veterinarian role');
        return false;
      }
    }
    
    console.log('✅ Users table structure correct\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to check users table:', error.message);
    issues.push('Failed to check users table structure');
    return false;
  }
}

// Test 4: Check Incidents Table Structure
async function testIncidentsTable() {
  console.log('📝 Test 4: Incidents Table Structure');
  try {
    const columns = await query('DESCRIBE incidents');
    const columnNames = columns.map(c => c.Field);
    
    const requiredColumns = ['id', 'title', 'description', 'location', 'status', 'priority', 'incident_type'];
    const missingColumns = requiredColumns.filter(c => !columnNames.includes(c));
    
    if (missingColumns.length > 0) {
      console.warn('⚠️  Missing columns:', missingColumns.join(', '));
      warnings.push(`Incidents table missing columns: ${missingColumns.join(', ')}`);
    }
    
    // Check status enum
    const statusColumn = columns.find(c => c.Field === 'status');
    if (statusColumn) {
      const statusValues = statusColumn.Type;
      console.log('   Status values:', statusValues);
      
      if (!statusValues.includes('PENDING_VERIFICATION')) {
        console.warn('⚠️  Status missing PENDING_VERIFICATION');
        warnings.push('Incidents status missing PENDING_VERIFICATION');
      }
    }
    
    console.log('✅ Incidents table checked\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to check incidents table:', error.message);
    issues.push('Failed to check incidents table structure');
    return false;
  }
}

// Test 5: Test User Authentication
async function testUserAuthentication() {
  console.log('🔐 Test 5: User Authentication');
  try {
    // Check if test users exist
    const users = await query('SELECT id, username, role FROM users WHERE username IN (?, ?, ?)', 
      ['testuser', 'catcher1', 'vet1']);
    
    if (users.length === 0) {
      console.warn('⚠️  No test users found. Run create-test-users.js');
      warnings.push('No test users found');
      return false;
    }
    
    console.log(`   Found ${users.length} test users:`);
    users.forEach(u => console.log(`   - ${u.username} (${u.role})`));
    
    // Test password hashing
    const testPassword = 'test123';
    const hash = await bcrypt.hash(testPassword, 10);
    const isValid = await bcrypt.compare(testPassword, hash);
    
    if (!isValid) {
      console.error('❌ Password hashing failed');
      issues.push('Password hashing not working');
      return false;
    }
    
    console.log('✅ User authentication setup correct\n');
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    issues.push('Authentication test failed');
    return false;
  }
}

// Test 6: Test JWT Configuration
async function testJWTConfiguration() {
  console.log('🔑 Test 6: JWT Configuration');
  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured in .env');
      issues.push('JWT_SECRET missing in .env');
      return false;
    }
    
    if (process.env.JWT_SECRET === 'your-secret-key-here') {
      console.warn('⚠️  Using default JWT_SECRET - please change it!');
      warnings.push('Using default JWT_SECRET');
    }
    
    // Test JWT generation
    const testPayload = { userId: 1, role: 'user' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userId !== 1) {
      console.error('❌ JWT generation/verification failed');
      issues.push('JWT not working correctly');
      return false;
    }
    
    console.log('✅ JWT configuration correct\n');
    return true;
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
    issues.push('JWT configuration failed');
    return false;
  }
}

// Test 7: Check Foreign Key Relationships
async function testForeignKeys() {
  console.log('🔗 Test 7: Foreign Key Relationships');
  try {
    const fks = await query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_NAME || 'cityvetcare_db']);
    
    if (fks.length === 0) {
      console.warn('⚠️  No foreign keys found');
      warnings.push('No foreign key relationships defined');
    } else {
      console.log(`   Found ${fks.length} foreign key relationships:`);
      fks.forEach(fk => {
        console.log(`   - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    }
    
    console.log('✅ Foreign keys checked\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to check foreign keys:', error.message);
    issues.push('Failed to check foreign keys');
    return false;
  }
}

// Test 8: Check Indexes
async function testIndexes() {
  console.log('⚡ Test 8: Database Indexes');
  try {
    const indexes = await query(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = ? 
        AND INDEX_NAME != 'PRIMARY'
      GROUP BY TABLE_NAME, INDEX_NAME
    `, [process.env.DB_NAME || 'cityvetcare_db']);
    
    console.log(`   Found ${indexes.length} indexes (excluding PRIMARY)`);
    
    if (indexes.length < 5) {
      console.warn('⚠️  Few indexes found - consider adding more for performance');
      warnings.push('Consider adding more indexes for better performance');
    }
    
    console.log('✅ Indexes checked\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to check indexes:', error.message);
    issues.push('Failed to check indexes');
    return false;
  }
}

// Test 9: Test Sample Data
async function testSampleData() {
  console.log('📊 Test 9: Sample Data Check');
  try {
    const counts = {
      users: await query('SELECT COUNT(*) as count FROM users'),
      incidents: await query('SELECT COUNT(*) as count FROM incidents'),
      catcher_teams: await query('SELECT COUNT(*) as count FROM catcher_teams'),
      patrol_staff: await query('SELECT COUNT(*) as count FROM patrol_staff'),
      patrol_schedules: await query('SELECT COUNT(*) as count FROM patrol_schedules')
    };
    
    console.log('   Data counts:');
    Object.entries(counts).forEach(([table, result]) => {
      const count = result[0].count;
      console.log(`   - ${table}: ${count} records`);
      
      if (count === 0 && table !== 'patrol_schedules') {
        warnings.push(`${table} table is empty`);
      }
    });
    
    console.log('✅ Sample data checked\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to check sample data:', error.message);
    issues.push('Failed to check sample data');
    return false;
  }
}

// Test 10: Check Stored Procedures
async function testStoredProcedures() {
  console.log('⚙️  Test 10: Stored Procedures');
  try {
    const procedures = await query(`
      SELECT ROUTINE_NAME 
      FROM INFORMATION_SCHEMA.ROUTINES
      WHERE ROUTINE_SCHEMA = ? 
        AND ROUTINE_TYPE = 'PROCEDURE'
    `, [process.env.DB_NAME || 'cityvetcare_db']);
    
    if (procedures.length > 0) {
      console.log(`   Found ${procedures.length} stored procedures:`);
      procedures.forEach(p => console.log(`   - ${p.ROUTINE_NAME}`));
    } else {
      console.log('   No stored procedures found (optional)');
    }
    
    console.log('✅ Stored procedures checked\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to check stored procedures:', error.message);
    issues.push('Failed to check stored procedures');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive tests...\n');
  
  const results = {
    databaseConnection: await testDatabaseConnection(),
    databaseTables: await testDatabaseTables(),
    usersTable: await testUsersTable(),
    incidentsTable: await testIncidentsTable(),
    userAuthentication: await testUserAuthentication(),
    jwtConfiguration: await testJWTConfiguration(),
    foreignKeys: await testForeignKeys(),
    indexes: await testIndexes(),
    sampleData: await testSampleData(),
    storedProcedures: await testStoredProcedures()
  };
  
  // Summary
  console.log('\n========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================\n');
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  console.log(`Tests Passed: ${passed}/${total}`);
  
  if (issues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:');
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach((warning, i) => console.log(`   ${i + 1}. ${warning}`));
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ ALL TESTS PASSED - Your backend and database are configured correctly!');
  } else if (issues.length === 0) {
    console.log('\n✅ All critical tests passed - Warnings are recommendations for improvement');
  } else {
    console.log('\n❌ Please fix the critical issues above');
  }
  
  console.log('\n========================================\n');
  process.exit(issues.length > 0 ? 1 : 0);
}

runAllTests();
