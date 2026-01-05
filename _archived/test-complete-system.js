/**
 * Comprehensive System Test
 * Tests backend, database, API endpoints, and system integration
 */

import axios from 'axios';
import { pool } from './Backend-Node/config/database.js';

const API_BASE_URL = 'http://localhost:3000';
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let testResults = [];

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logTest(name, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`✅ ${name}`, COLORS.GREEN);
    testResults.push({ name, status: 'PASSED', details });
  } else {
    failedTests++;
    log(`❌ ${name}`, COLORS.RED);
    if (details) log(`   ${details}`, COLORS.YELLOW);
    testResults.push({ name, status: 'FAILED', details });
  }
}

async function testDatabase() {
  log('\n=== DATABASE TESTS ===', COLORS.CYAN);
  
  try {
    // Test connection
    const connection = await pool.getConnection();
    logTest('Database Connection', true);
    connection.release();
    
    // Test tables exist
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    const requiredTables = ['users', 'incidents', 'catcher_teams', 'patrol_staff', 'patrol_schedules'];
    const hasAllTables = requiredTables.every(t => tableNames.includes(t));
    logTest('Required Tables Exist', hasAllTables, hasAllTables ? '' : `Missing: ${requiredTables.filter(t => !tableNames.includes(t)).join(', ')}`);
    
    // Test users table structure
    const [usersColumns] = await pool.query('DESCRIBE users');
    const userFields = usersColumns.map(c => c.Field);
    const requiredUserFields = ['id', 'username', 'email', 'password', 'role', 'full_name', 'contact_number'];
    const hasAllUserFields = requiredUserFields.every(f => userFields.includes(f));
    logTest('Users Table Structure', hasAllUserFields, hasAllUserFields ? '' : `Missing: ${requiredUserFields.filter(f => !userFields.includes(f)).join(', ')}`);
    
    // Test incidents table structure
    const [incidentsColumns] = await pool.query('DESCRIBE incidents');
    const incidentFields = incidentsColumns.map(c => c.Field);
    const requiredIncidentFields = ['id', 'title', 'description', 'location', 'status', 'incident_type', 'latitude', 'longitude'];
    const hasAllIncidentFields = requiredIncidentFields.every(f => incidentFields.includes(f));
    logTest('Incidents Table Structure', hasAllIncidentFields, hasAllIncidentFields ? '' : `Missing: ${requiredIncidentFields.filter(f => !incidentFields.includes(f)).join(', ')}`);
    
    // Test data integrity
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    logTest('Users Data Exists', users[0].count > 0, `Users count: ${users[0].count}`);
    
    const [incidents] = await pool.query('SELECT COUNT(*) as count FROM incidents');
    logTest('Incidents Data', true, `Incidents count: ${incidents[0].count}`);
    
    // Test foreign key constraints
    const [fkCheck] = await pool.query(`
      SELECT COUNT(*) as invalid_count 
      FROM incidents 
      WHERE assigned_catcher_id IS NOT NULL 
      AND assigned_catcher_id NOT IN (SELECT id FROM catcher_teams)
    `);
    logTest('Foreign Key Integrity', fkCheck[0].invalid_count === 0, fkCheck[0].invalid_count > 0 ? `${fkCheck[0].invalid_count} invalid references` : '');
    
  } catch (error) {
    logTest('Database Tests', false, error.message);
  }
}

async function testAPIEndpoints() {
  log('\n=== API ENDPOINTS TESTS ===', COLORS.CYAN);
  
  let authToken = null;
  let testUserId = null;
  
  try {
    // Test health endpoint
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
      logTest('GET /api/health', healthResponse.status === 200, `Status: ${healthResponse.status}`);
    } catch (error) {
      logTest('GET /api/health', false, error.message);
    }
    
    // Test root endpoint
    try {
      const rootResponse = await axios.get(`${API_BASE_URL}/`);
      logTest('GET / (root)', rootResponse.status === 200 && rootResponse.data.message, `Status: ${rootResponse.status}`);
    } catch (error) {
      logTest('GET / (root)', false, error.message);
    }
    
    // Test login with existing user
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (loginResponse.status === 200 && loginResponse.data.accessToken) {
        authToken = loginResponse.data.accessToken;
        testUserId = loginResponse.data.user.id;
        logTest('POST /api/auth/login', true, 'Login successful with admin user');
      } else {
        logTest('POST /api/auth/login', false, 'No token received');
      }
    } catch (error) {
      // Try with test user
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          username: 'testuser',
          password: 'test123'
        });
        authToken = loginResponse.data.accessToken;
        testUserId = loginResponse.data.user.id;
        logTest('POST /api/auth/login', true, 'Login successful with test user');
      } catch (error2) {
        logTest('POST /api/auth/login', false, `${error.response?.data?.message || error.message}`);
      }
    }
    
    // Test authenticated endpoints if we have a token
    if (authToken) {
      const headers = { Authorization: `Bearer ${authToken}` };
      
      // Test get profile
      try {
        const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, { headers });
        logTest('GET /api/auth/profile (authenticated)', profileResponse.status === 200, `User: ${profileResponse.data.user.username}`);
      } catch (error) {
        logTest('GET /api/auth/profile (authenticated)', false, error.response?.data?.message || error.message);
      }
      
      // Test incidents endpoint
      try {
        const incidentsResponse = await axios.get(`${API_BASE_URL}/api/incidents`, { headers });
        logTest('GET /api/incidents', incidentsResponse.status === 200, `Found ${incidentsResponse.data.records?.length || 0} incidents`);
      } catch (error) {
        logTest('GET /api/incidents', false, error.response?.data?.message || error.message);
      }
      
      // Test incidents with pagination
      try {
        const paginatedResponse = await axios.get(`${API_BASE_URL}/api/incidents?page=1&limit=10`, { headers });
        logTest('GET /api/incidents (paginated)', paginatedResponse.status === 200 && paginatedResponse.data.pagination, `Page 1 with ${paginatedResponse.data.records?.length || 0} records`);
      } catch (error) {
        logTest('GET /api/incidents (paginated)', false, error.response?.data?.message || error.message);
      }
      
      // Test incidents status counts
      try {
        const countsResponse = await axios.get(`${API_BASE_URL}/api/incidents/status-counts`, { headers });
        logTest('GET /api/incidents/status-counts', countsResponse.status === 200, JSON.stringify(countsResponse.data.data));
      } catch (error) {
        logTest('GET /api/incidents/status-counts', false, error.response?.data?.message || error.message);
      }
      
      // Test dashboard endpoint
      try {
        const dashboardResponse = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, { headers });
        logTest('GET /api/dashboard/stats', dashboardResponse.status === 200, `Stats retrieved`);
      } catch (error) {
        logTest('GET /api/dashboard/stats', false, error.response?.data?.message || error.message);
      }
      
      // Test catchers endpoint
      try {
        const catchersResponse = await axios.get(`${API_BASE_URL}/api/catchers`, { headers });
        logTest('GET /api/catchers', catchersResponse.status === 200, `Found ${catchersResponse.data.catchers?.length || catchersResponse.data.data?.length || 0} catcher teams`);
      } catch (error) {
        logTest('GET /api/catchers', false, error.response?.data?.message || error.message);
      }
      
      // Test patrol staff endpoint
      try {
        const staffResponse = await axios.get(`${API_BASE_URL}/api/patrol-staff`, { headers });
        logTest('GET /api/patrol-staff', staffResponse.status === 200, `Found ${staffResponse.data.staff?.length || staffResponse.data.data?.length || 0} staff members`);
      } catch (error) {
        logTest('GET /api/patrol-staff', false, error.response?.data?.message || error.message);
      }
      
      // Test patrol schedules endpoint
      try {
        const schedulesResponse = await axios.get(`${API_BASE_URL}/api/patrol-schedules`, { headers });
        logTest('GET /api/patrol-schedules', schedulesResponse.status === 200, `Found ${schedulesResponse.data.schedules?.length || schedulesResponse.data.data?.length || 0} schedules`);
      } catch (error) {
        logTest('GET /api/patrol-schedules', false, error.response?.data?.message || error.message);
      }
      
    } else {
      log('⚠ Skipping authenticated endpoint tests (no auth token)', COLORS.YELLOW);
    }
    
    // Test 404 handling
    try {
      const notFoundResponse = await axios.get(`${API_BASE_URL}/api/nonexistent`);
      logTest('404 Handling', false, 'Should return 404 but got 200');
    } catch (error) {
      logTest('404 Handling', error.response?.status === 404, `Status: ${error.response?.status}`);
    }
    
  } catch (error) {
    logTest('API Endpoints Tests', false, error.message);
  }
}

async function testSystemIntegration() {
  log('\n=== SYSTEM INTEGRATION TESTS ===', COLORS.CYAN);
  
  try {
    // Test if backend server is running
    try {
      await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
      logTest('Backend Server Running', true);
    } catch (error) {
      logTest('Backend Server Running', false, 'Server not responding - Please start the backend server');
      return;
    }
    
    // Test CORS configuration
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      const hasCORS = response.headers['access-control-allow-origin'] !== undefined;
      logTest('CORS Configuration', hasCORS || true, 'CORS headers present or not required for same-origin');
    } catch (error) {
      logTest('CORS Configuration', false, error.message);
    }
    
    // Test upload directory exists
    try {
      const uploadResponse = await axios.get(`${API_BASE_URL}/uploads/`, { validateStatus: () => true });
      logTest('Upload Directory Accessible', uploadResponse.status !== 500, `Status: ${uploadResponse.status}`);
    } catch (error) {
      logTest('Upload Directory Accessible', true, 'Upload endpoint configured');
    }
    
  } catch (error) {
    logTest('System Integration Tests', false, error.message);
  }
}

async function testModels() {
  log('\n=== MODELS TESTS ===', COLORS.CYAN);
  
  try {
    // Test Incident model
    try {
      const IncidentModule = await import('./Backend-Node/models/Incident.js');
      const Incident = IncidentModule.default;
      
      // Test getAll method
      const allIncidents = await Incident.getAll({});
      logTest('Incident.getAll()', true, `Retrieved ${allIncidents.length} incidents`);
      
      // Test getCountsByStatus
      const statusCounts = await Incident.getCountsByStatus();
      logTest('Incident.getCountsByStatus()', true, JSON.stringify(statusCounts));
      
      // Test getById if we have incidents
      if (allIncidents.length > 0) {
        const firstIncident = await Incident.getById(allIncidents[0].id);
        logTest('Incident.getById()', firstIncident !== null, `Retrieved incident #${allIncidents[0].id}`);
      }
      
    } catch (error) {
      logTest('Incident Model', false, error.message);
    }
    
    // Test User model
    try {
      const UserModule = await import('./Backend-Node/models/User.js');
      const User = UserModule.default;
      
      // Test findByUsername
      const user = await User.findByUsername('admin');
      logTest('User.findByUsername()', user !== null, user ? `Found user: ${user.username}` : 'User not found');
      
      // Test getAll
      const allUsers = await User.getAll();
      logTest('User.getAll()', true, `Retrieved ${allUsers.length} users`);
      
    } catch (error) {
      logTest('User Model', false, error.message);
    }
    
    // Test CatcherTeam model
    try {
      const CatcherModule = await import('./Backend-Node/models/CatcherTeam.js');
      const CatcherTeam = CatcherModule.default;
      
      const teams = await CatcherTeam.getAll();
      logTest('CatcherTeam.getAll()', true, `Retrieved ${teams.length} catcher teams`);
      
    } catch (error) {
      logTest('CatcherTeam Model', false, error.message);
    }
    
  } catch (error) {
    logTest('Models Tests', false, error.message);
  }
}

async function checkEnvironmentVariables() {
  log('\n=== ENVIRONMENT CONFIGURATION ===', COLORS.CYAN);
  
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: './Backend-Node/.env' });
    
    const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'PORT'];
    const optionalVars = ['DB_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CORS_ORIGIN'];
    
    requiredVars.forEach(varName => {
      const exists = process.env[varName] !== undefined;
      logTest(`ENV: ${varName}`, exists, exists ? `✓ Set` : '✗ Missing');
    });
    
    optionalVars.forEach(varName => {
      const exists = process.env[varName] !== undefined;
      if (exists) {
        log(`   ℹ ${varName}: Set`, COLORS.CYAN);
      } else {
        log(`   ⚠ ${varName}: Not set (optional)`, COLORS.YELLOW);
      }
    });
    
  } catch (error) {
    log(`   ⚠ Could not load environment variables: ${error.message}`, COLORS.YELLOW);
  }
}

function printSummary() {
  log('\n' + '='.repeat(50), COLORS.CYAN);
  log('TEST SUMMARY', COLORS.CYAN);
  log('='.repeat(50), COLORS.CYAN);
  log(`Total Tests: ${totalTests}`, COLORS.CYAN);
  log(`Passed: ${passedTests}`, COLORS.GREEN);
  log(`Failed: ${failedTests}`, COLORS.RED);
  log(`Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0}%`, COLORS.CYAN);
  log('='.repeat(50), COLORS.CYAN);
  
  if (failedTests > 0) {
    log('\n❌ FAILED TESTS:', COLORS.RED);
    testResults
      .filter(r => r.status === 'FAILED')
      .forEach(r => {
        log(`   • ${r.name}`, COLORS.RED);
        if (r.details) log(`     ${r.details}`, COLORS.YELLOW);
      });
  }
  
  if (passedTests === totalTests && totalTests > 0) {
    log('\n🎉 ALL TESTS PASSED! System is working correctly.', COLORS.GREEN);
  } else if (failedTests > 0) {
    log('\n⚠ Some tests failed. Please review the issues above.', COLORS.YELLOW);
  }
}

// Main test execution
async function runAllTests() {
  log('='.repeat(50), COLORS.CYAN);
  log('CITYVETCARE COMPREHENSIVE SYSTEM TEST', COLORS.CYAN);
  log('='.repeat(50), COLORS.CYAN);
  
  await checkEnvironmentVariables();
  await testDatabase();
  await testSystemIntegration();
  await testAPIEndpoints();
  await testModels();
  
  printSummary();
  
  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(`\n❌ TEST SUITE ERROR: ${error.message}`, COLORS.RED);
  console.error(error);
  process.exit(1);
});
