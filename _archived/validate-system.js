/**
 * Quick System Validation Test
 * Tests the CityVetCare system with backend running
 * Run this after starting the backend server
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

async function testSystem() {
  log('\n=== CITYVETCARE SYSTEM VALIDATION ===\n', COLORS.CYAN);
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Backend Health
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    if (response.status === 200) {
      log('✅ Backend server is running', COLORS.GREEN);
      passed++;
    }
  } catch (error) {
    log('❌ Backend server is NOT running - Please start it first', COLORS.RED);
    log('   Run: cd Backend-Node && npm start', COLORS.YELLOW);
    failed++;
    process.exit(1);
  }
  
  // Test 2: Root endpoint
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    if (response.data.message && response.data.endpoints) {
      log('✅ API root endpoint working', COLORS.GREEN);
      passed++;
    }
  } catch (error) {
    log('❌ API root endpoint failed', COLORS.RED);
    failed++;
  }
  
  // Test 3: Authentication
  let authToken = null;
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.data.accessToken) {
      authToken = response.data.accessToken;
      log('✅ Authentication working', COLORS.GREEN);
      log(`   Logged in as: ${response.data.user.username} (${response.data.user.role})`, COLORS.CYAN);
      passed++;
    }
  } catch (error) {
    log('❌ Authentication failed', COLORS.RED);
    log(`   ${error.response?.data?.message || error.message}`, COLORS.YELLOW);
    failed++;
  }
  
  if (!authToken) {
    log('\n⚠ Cannot test protected endpoints without authentication', COLORS.YELLOW);
    printSummary(passed, failed);
    return;
  }
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test 4: Get incidents
  try {
    const response = await axios.get(`${API_BASE_URL}/api/incidents`, { headers });
    if (response.data.success) {
      log('✅ Incidents API working', COLORS.GREEN);
      log(`   Found ${response.data.records?.length || 0} incidents (Page ${response.data.pagination?.page || 1})`, COLORS.CYAN);
      passed++;
    }
  } catch (error) {
    log('❌ Incidents API failed', COLORS.RED);
    failed++;
  }
  
  // Test 5: Incident status counts
  try {
    const response = await axios.get(`${API_BASE_URL}/api/incidents/status-counts`, { headers });
    if (response.data.success) {
      log('✅ Incident statistics working', COLORS.GREEN);
      passed++;
    }
  } catch (error) {
    log('❌ Incident statistics failed', COLORS.RED);
    failed++;
  }
  
  // Test 6: Dashboard stats
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard`, { headers });
    if (response.status === 200 && response.data.success) {
      log('✅ Dashboard API working', COLORS.GREEN);
      log(`   Total incidents: ${response.data.summary?.total_incidents || 0}`, COLORS.CYAN);
      passed++;
    }
  } catch (error) {
    log('❌ Dashboard API failed', COLORS.RED);
    log(`   ${error.response?.data?.message || error.message}`, COLORS.YELLOW);
    failed++;
  }
  
  // Test 7: Catcher teams
  try {
    const response = await axios.get(`${API_BASE_URL}/api/catchers`, { headers });
    if (response.status === 200) {
      const teams = response.data.catchers || response.data.data || [];
      log('✅ Catcher teams API working', COLORS.GREEN);
      log(`   Found ${teams.length} catcher teams`, COLORS.CYAN);
      passed++;
    }
  } catch (error) {
    log('❌ Catcher teams API failed', COLORS.RED);
    failed++;
  }
  
  // Test 8: Patrol staff
  try {
    const response = await axios.get(`${API_BASE_URL}/api/patrol-staff`, { headers });
    if (response.status === 200) {
      log('✅ Patrol staff API working', COLORS.GREEN);
      passed++;
    }
  } catch (error) {
    log('❌ Patrol staff API failed', COLORS.RED);
    failed++;
  }
  
  // Test 9: Patrol schedules
  try {
    const response = await axios.get(`${API_BASE_URL}/api/patrol-schedules`, { headers });
    if (response.status === 200) {
      log('✅ Patrol schedules API working', COLORS.GREEN);
      passed++;
    }
  } catch (error) {
    log('❌ Patrol schedules API failed', COLORS.RED);
    failed++;
  }
  
  // Test 10: User profile
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, { headers });
    if (response.data.success && response.data.user) {
      log('✅ User profile API working', COLORS.GREEN);
      log(`   Profile: ${response.data.user.full_name || response.data.user.username}`, COLORS.CYAN);
      passed++;
    }
  } catch (error) {
    log('❌ User profile API failed', COLORS.RED);
    log(`   ${error.response?.data?.message || error.message}`, COLORS.YELLOW);
    failed++;
  }
  
  printSummary(passed, failed);
}

function printSummary(passed, failed) {
  const total = passed + failed;
  const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  
  log('\n' + '='.repeat(50), COLORS.CYAN);
  log('VALIDATION SUMMARY', COLORS.CYAN);
  log('='.repeat(50), COLORS.CYAN);
  log(`Total Tests: ${total}`, COLORS.CYAN);
  log(`Passed: ${passed}`, COLORS.GREEN);
  log(`Failed: ${failed}`, failed > 0 ? COLORS.RED : COLORS.GREEN);
  log(`Success Rate: ${percentage}%`, COLORS.CYAN);
  log('='.repeat(50), COLORS.CYAN);
  
  if (failed === 0) {
    log('\n🎉 ALL SYSTEMS OPERATIONAL!', COLORS.GREEN);
    log('✨ CityVetCare is ready to use', COLORS.GREEN);
  } else {
    log('\n⚠ Some tests failed', COLORS.YELLOW);
    log('Please check the errors above', COLORS.YELLOW);
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testSystem().catch(error => {
  log(`\n❌ Test execution error: ${error.message}`, COLORS.RED);
  process.exit(1);
});
