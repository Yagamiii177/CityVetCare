import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

console.log('🧪 Testing Backend API Endpoints\n');
console.log('API URL:', API_URL, '\n');

let authToken = '';
let testIncidentId = null;

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${message ? ': ' + message : ''}`);
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// Test 1: Health Check
async function testHealthCheck() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    logTest('Health Check', response.status === 200 && response.data.status === 'OK');
  } catch (error) {
    logTest('Health Check', false, error.message);
  }
}

// Test 2: Login
async function testLogin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'vet1',
      password: 'test123'
    });
    
    if (response.data.success && response.data.data.accessToken) {
      authToken = response.data.data.accessToken;
      logTest('Login (Veterinarian)', true);
      return true;
    }
    logTest('Login (Veterinarian)', false, 'No token received');
    return false;
  } catch (error) {
    logTest('Login (Veterinarian)', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 3: Get Current User
async function testGetCurrentUser() {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const isValid = response.data.success && response.data.data.user.role === 'veterinarian';
    logTest('Get Current User', isValid);
  } catch (error) {
    logTest('Get Current User', false, error.response?.data?.message || error.message);
  }
}

// Test 4: Get Dashboard Stats
async function testDashboardStats() {
  try {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const hasData = response.data.success && response.data.data.incidents;
    logTest('Dashboard Stats', hasData);
  } catch (error) {
    logTest('Dashboard Stats', false, error.response?.data?.message || error.message);
  }
}

// Test 5: Get All Incidents
async function testGetIncidents() {
  try {
    const response = await axios.get(`${API_URL}/incidents`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const hasRecords = response.data.success && Array.isArray(response.data.records);
    if (hasRecords && response.data.records.length > 0) {
      testIncidentId = response.data.records[0].id;
    }
    logTest('Get All Incidents', hasRecords, `Found ${response.data.records?.length || 0} incidents`);
  } catch (error) {
    logTest('Get All Incidents', false, error.response?.data?.message || error.message);
  }
}

// Test 6: Get Single Incident
async function testGetSingleIncident() {
  if (!testIncidentId) {
    logTest('Get Single Incident', false, 'No incident ID available');
    return;
  }
  
  try {
    const response = await axios.get(`${API_URL}/incidents/${testIncidentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const hasData = response.data.success && response.data.data.id === testIncidentId;
    logTest('Get Single Incident', hasData);
  } catch (error) {
    logTest('Get Single Incident', false, error.response?.data?.message || error.message);
  }
}

// Test 7: Get Patrol Staff
async function testGetPatrolStaff() {
  try {
    const response = await axios.get(`${API_URL}/patrol-staff`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const hasRecords = response.data.success && Array.isArray(response.data.records);
    logTest('Get Patrol Staff', hasRecords, `Found ${response.data.records?.length || 0} staff`);
  } catch (error) {
    logTest('Get Patrol Staff', false, error.response?.data?.message || error.message);
  }
}

// Test 8: Get Patrol Schedules
async function testGetPatrolSchedules() {
  try {
    const response = await axios.get(`${API_URL}/patrol-schedules`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const hasRecords = response.data.success && Array.isArray(response.data.records);
    logTest('Get Patrol Schedules', hasRecords, `Found ${response.data.records?.length || 0} schedules`);
  } catch (error) {
    logTest('Get Patrol Schedules', false, error.response?.data?.message || error.message);
  }
}

// Test 9: Get Notifications
async function testGetNotifications() {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const hasRecords = response.data.success && Array.isArray(response.data.records);
    logTest('Get Notifications', hasRecords);
  } catch (error) {
    logTest('Get Notifications', false, error.response?.data?.message || error.message);
  }
}

// Test 10: Unauthorized Access
async function testUnauthorizedAccess() {
  try {
    const response = await axios.get(`${API_URL}/dashboard`);
    logTest('Unauthorized Access Protection', false, 'Should have been blocked');
  } catch (error) {
    const isUnauthorized = error.response?.status === 401;
    logTest('Unauthorized Access Protection', isUnauthorized);
  }
}

// Test 11: Invalid Login
async function testInvalidLogin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'invalid',
      password: 'wrong'
    });
    logTest('Invalid Login Protection', false, 'Should have been rejected');
  } catch (error) {
    const isUnauthorized = error.response?.status === 401;
    logTest('Invalid Login Protection', isUnauthorized);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting API endpoint tests...\n');
  
  await testHealthCheck();
  
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n⚠️  Login failed - skipping authenticated tests');
    console.log('Make sure the backend server is running: node server.js\n');
    return;
  }
  
  await testGetCurrentUser();
  await testDashboardStats();
  await testGetIncidents();
  await testGetSingleIncident();
  await testGetPatrolStaff();
  await testGetPatrolSchedules();
  await testGetNotifications();
  await testUnauthorizedAccess();
  await testInvalidLogin();
  
  // Summary
  console.log('\n========================================');
  console.log('📊 API TEST SUMMARY');
  console.log('========================================');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All API endpoints are working correctly!');
  } else {
    console.log('\n⚠️  Some tests failed - check the details above');
  }
  console.log('========================================\n');
}

runAllTests().catch(error => {
  console.error('Fatal error running tests:', error.message);
  process.exit(1);
});
