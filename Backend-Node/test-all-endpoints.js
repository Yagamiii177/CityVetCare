import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

/**
 * Test helper function
 */
async function testEndpoint(method, endpoint, description, options = {}) {
  testResults.total++;
  
  try {
    console.log(`\n${colors.blue}Testing: ${description}${colors.reset}`);
    console.log(`${colors.gray}${method} ${endpoint}${colors.reset}`);
    
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      ...options
    };
    
    const response = await axios(config);
    
    console.log(`${colors.green}✓ PASSED${colors.reset} - Status: ${response.status}`);
    if (response.data) {
      console.log(`Response:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    }
    
    testResults.passed++;
    return { success: true, data: response.data };
    
  } catch (error) {
    if (error.response) {
      console.log(`${colors.red}✗ FAILED${colors.reset} - Status: ${error.response.status}`);
      console.log(`Response:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`${colors.red}✗ FAILED - Server not running or not accessible${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ FAILED - ${error.message}${colors.reset}`);
    }
    
    testResults.failed++;
    return { success: false, error: error.message };
  }
}

/**
 * Run all endpoint tests
 */
async function runTests() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}CityVetCare Backend - Comprehensive Endpoint Test${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log(`Start Time: ${new Date().toLocaleString()}\n`);
  
  // ============================================
  // 1. HEALTH & ROOT ENDPOINTS
  // ============================================
  console.log(`\n${colors.yellow}=== 1. Health & Root Endpoints ===${colors.reset}`);
  
  await testEndpoint('GET', '/', 'Root endpoint');
  await testEndpoint('GET', '/api/health', 'Health check');
  
  // ============================================
  // 2. AUTHENTICATION ENDPOINTS
  // ============================================
  console.log(`\n${colors.yellow}=== 2. Authentication Endpoints ===${colors.reset}`);
  
  // Test login - Admin
  const adminLogin = await testEndpoint('POST', '/api/auth/login', 'Admin login', {
    data: {
      username: 'admin',
      password: 'admin123',
      userType: 'admin'
    }
  });
  
  let adminToken = null;
  if (adminLogin.success && adminLogin.data.token) {
    adminToken = adminLogin.data.token;
    console.log(`${colors.green}Admin token received${colors.reset}`);
  }
  
  // Test login - Pet Owner
  await testEndpoint('POST', '/api/auth/login', 'Pet owner login', {
    data: {
      username: 'owner@example.com',
      password: 'password123',
      userType: 'pet_owner'
    }
  });
  
  // Test create admin (should work)
  await testEndpoint('POST', '/api/auth/create-admin', 'Create admin account', {
    data: {
      fullName: 'Test Admin',
      username: 'testadmin_' + Date.now(),
      password: 'test1234',
      role: 'staff'
    }
  });
  
  // Test register pet owner
  await testEndpoint('POST', '/api/auth/register', 'Register pet owner account', {
    data: {
      fullName: 'Test Owner',
      email: 'testowner_' + Date.now() + '@example.com',
      password: 'test1234',
      confirmPassword: 'test1234',
      contactNumber: '09123456789',
      address: '123 Test Street'
    }
  });
  
  // Test invalid login
  await testEndpoint('POST', '/api/auth/login', 'Invalid login (should fail)', {
    data: {
      username: 'wronguser',
      password: 'wrongpassword',
      userType: 'admin'
    }
  });
  
  // ============================================
  // 3. INCIDENTS ENDPOINTS
  // ============================================
  console.log(`\n${colors.yellow}=== 3. Incidents Endpoints ===${colors.reset}`);
  
  // Get all incidents
  const incidentsResult = await testEndpoint('GET', '/api/incidents', 'Get all incidents');
  
  // Get incidents with filters
  await testEndpoint('GET', '/api/incidents?status=pending', 'Get pending incidents');
  await testEndpoint('GET', '/api/incidents?incident_type=stray', 'Get stray incidents');
  await testEndpoint('GET', '/api/incidents?search=dog', 'Search incidents');
  await testEndpoint('GET', '/api/incidents?page=1', 'Get incidents with pagination');
  
  // Get status counts
  await testEndpoint('GET', '/api/incidents/status-counts', 'Get incident status counts');
  
  // Create new incident
  const newIncident = await testEndpoint('POST', '/api/incidents', 'Create new incident', {
    data: {
      title: 'Test Incident - ' + new Date().toLocaleString(),
      description: 'This is a test incident created by automated test',
      incident_type: 'stray',
      animal_type: 'dog',
      location: 'Test Location, Test Street',
      reporter_name: 'Test Reporter',
      reporter_contact: '09123456789',
      status: 'pending'
    }
  });
  
  let testIncidentId = null;
  if (newIncident.success && newIncident.data.id) {
    testIncidentId = newIncident.data.id;
    console.log(`${colors.green}Test incident created with ID: ${testIncidentId}${colors.reset}`);
    
    // Get specific incident
    await testEndpoint('GET', `/api/incidents/${testIncidentId}`, 'Get incident by ID');
    
    // Update incident
    await testEndpoint('PUT', `/api/incidents/${testIncidentId}`, 'Update incident', {
      data: {
        status: 'verified',
        notes: 'Updated by automated test'
      }
    });
    
    // Get updated incident
    await testEndpoint('GET', `/api/incidents/${testIncidentId}`, 'Get updated incident');
  }
  
  // Test non-existent incident
  await testEndpoint('GET', '/api/incidents/99999', 'Get non-existent incident (should fail)');
  
  // ============================================
  // 4. CATCHER TEAMS ENDPOINTS
  // ============================================
  console.log(`\n${colors.yellow}=== 4. Catcher Teams Endpoints ===${colors.reset}`);
  
  const catchersResult = await testEndpoint('GET', '/api/catchers', 'Get all catcher teams');
  
  // Test get specific catcher
  if (catchersResult.success && catchersResult.data.data && catchersResult.data.data.length > 0) {
    const catcherId = catchersResult.data.data[0].id;
    await testEndpoint('GET', `/api/catchers/${catcherId}`, 'Get catcher team by ID');
  }
  
  // Test non-existent catcher
  await testEndpoint('GET', '/api/catchers/99999', 'Get non-existent catcher (should fail)');
  
  // ============================================
  // 5. DASHBOARD ENDPOINTS
  // ============================================
  console.log(`\n${colors.yellow}=== 5. Dashboard Endpoints ===${colors.reset}`);
  
  await testEndpoint('GET', '/api/dashboard', 'Get dashboard data');
  await testEndpoint('GET', '/api/dashboard/stats', 'Get dashboard stats');
  
  // ============================================
  // 6. SCHEDULES ENDPOINTS
  // ============================================
  console.log(`\n${colors.yellow}=== 6. Schedules Endpoints ===${colors.reset}`);
  
  const schedulesResult = await testEndpoint('GET', '/api/schedules', 'Get all schedules');
  
  // Create schedule if we have a test incident
  if (testIncidentId) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduledDate = tomorrow.toISOString().split('T')[0];
    
    const newSchedule = await testEndpoint('POST', '/api/schedules', 'Create new schedule', {
      data: {
        incident_id: testIncidentId,
        assigned_staff_name: 'Test Staff',
        scheduled_date: scheduledDate,
        scheduled_time: '09:00:00',
        notes: 'Test schedule created by automated test'
      }
    });
    
    if (newSchedule.success && newSchedule.data.id) {
      const scheduleId = newSchedule.data.id;
      
      // Update schedule
      await testEndpoint('PUT', `/api/schedules/${scheduleId}`, 'Update schedule', {
        data: {
          status: 'completed',
          notes: 'Updated by automated test'
        }
      });
    }
  }
  
  // Test non-existent endpoint
  console.log(`\n${colors.yellow}=== 7. Invalid Endpoints (Expected to Fail) ===${colors.reset}`);
  await testEndpoint('GET', '/api/nonexistent', 'Non-existent endpoint (404 expected)');
  
  // ============================================
  // CLEANUP (Optional)
  // ============================================
  if (testIncidentId) {
    console.log(`\n${colors.yellow}=== Cleanup ===${colors.reset}`);
    await testEndpoint('DELETE', `/api/incidents/${testIncidentId}`, 'Delete test incident');
  }
  
  // ============================================
  // SUMMARY
  // ============================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log(`End Time: ${new Date().toLocaleString()}`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Exit code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal error running tests:${colors.reset}`, error);
  process.exit(1);
});
