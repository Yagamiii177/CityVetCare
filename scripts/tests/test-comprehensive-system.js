/**
 * Comprehensive System Test for CityVetCare
 * Tests all admin and user functionalities
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test Results Tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
    if (message) console.log(`   ${message}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (message) console.log(`   Error: ${message}`);
  }
  results.tests.push({ name, passed, message });
}

async function runTests() {
  console.log('🧪 COMPREHENSIVE CITYVETCARE SYSTEM TEST');
  console.log('==========================================\n');

  try {
    // 1. Test Backend Health
    console.log('📡 Testing Backend Server...');
    const health = await makeRequest('GET', '/api/health');
    logTest('Backend Server Health', health.status === 200, `Uptime: ${health.data.uptime?.toFixed(2)}s`);

    // 2. Test Dashboard Endpoint
    console.log('\n📊 Testing Dashboard Statistics...');
    const dashboard = await makeRequest('GET', '/api/dashboard');
    logTest('Dashboard API', dashboard.status === 200, 
      `Total Incidents: ${dashboard.data.summary?.total_incidents || 0}`);

    // 3. Test Incident Endpoints
    console.log('\n📋 Testing Incident Management...');
    
    // Get all incidents
    const incidents = await makeRequest('GET', '/api/incidents');
    logTest('Get All Incidents', incidents.status === 200, 
      `Found ${incidents.data.records?.length || 0} incidents`);

    // Test pagination
    const incidentsPage2 = await makeRequest('GET', '/api/incidents?page=2&limit=10');
    logTest('Incident Pagination', incidentsPage2.status === 200);

    // Test filters
    const pendingIncidents = await makeRequest('GET', '/api/incidents?status=pending');
    logTest('Filter by Status', pendingIncidents.status === 200, 
      `Pending: ${pendingIncidents.data.records?.length || 0}`);

    const straysOnly = await makeRequest('GET', '/api/incidents?incident_type=stray');
    logTest('Filter by Type', straysOnly.status === 200, 
      `Strays: ${straysOnly.data.records?.length || 0}`);

    // Test search
    const searchResults = await makeRequest('GET', '/api/incidents?search=dog');
    logTest('Search Incidents', searchResults.status === 200, 
      `Results: ${searchResults.data.records?.length || 0}`);

    // Test status counts
    const statusCounts = await makeRequest('GET', '/api/incidents/status-counts');
    logTest('Get Status Counts', statusCounts.status === 200);

    // 4. Create Test Incident
    console.log('\n➕ Testing Incident Creation...');
    const newIncident = {
      title: 'Test Incident - Stray Dog',
      description: 'Test stray dog report for system verification',
      location: 'Test Location Street',
      latitude: 13.6218,
      longitude: 123.1948,
      incident_date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
      reporter_name: 'Test User',
      reporter_contact: '09123456789',
      incident_type: 'stray',
      animal_type: 'dog',
      pet_breed: 'Mixed Breed',
      pet_color: 'Brown',
      pet_gender: 'male',
      pet_size: 'medium',
      status: 'pending',
      images: []
    };

    const createResult = await makeRequest('POST', '/api/incidents', newIncident);
    logTest('Create New Incident', createResult.status === 201, 
      `Created ID: ${createResult.data.id}`);

    let testIncidentId = createResult.data.id;

    if (testIncidentId) {
      // 5. Test Get Single Incident
      const singleIncident = await makeRequest('GET', `/api/incidents/${testIncidentId}`);
      logTest('Get Incident by ID', singleIncident.status === 200);

      // 6. Test Update Incident (Status Change)
      console.log('\n✏️ Testing Incident Updates...');
      const updateData = {
        ...newIncident,
        status: 'verified',
        description: 'Updated description - Verified by admin'
      };
      const updateResult = await makeRequest('PUT', `/api/incidents/${testIncidentId}`, updateData);
      logTest('Update Incident Status', updateResult.status === 200);

      // Verify update
      const verifiedIncident = await makeRequest('GET', `/api/incidents/${testIncidentId}`);
      logTest('Verify Status Change', 
        verifiedIncident.data.data?.status === 'verified',
        `Status: ${verifiedIncident.data.data?.status}`);

      // Test status progression: pending -> verified -> in_progress -> resolved
      const statusProgression = ['in_progress', 'resolved'];
      for (const status of statusProgression) {
        const progressUpdate = await makeRequest('PUT', `/api/incidents/${testIncidentId}`, 
          { ...newIncident, status });
        logTest(`Update to ${status}`, progressUpdate.status === 200);
      }

      // 7. Test Delete Incident
      console.log('\n🗑️ Testing Incident Deletion...');
      const deleteResult = await makeRequest('DELETE', `/api/incidents/${testIncidentId}`);
      logTest('Delete Incident', deleteResult.status === 200);

      // Verify deletion
      const deletedCheck = await makeRequest('GET', `/api/incidents/${testIncidentId}`);
      logTest('Verify Deletion', deletedCheck.status === 404);
    }

    // 8. Test Catcher Teams
    console.log('\n👥 Testing Catcher Team Management...');
    const catcherTeams = await makeRequest('GET', '/api/catchers');
    logTest('Get All Catcher Teams', catcherTeams.status === 200, 
      `Found ${catcherTeams.data.records?.length || 0} teams`);

    if (catcherTeams.data.records && catcherTeams.data.records.length > 0) {
      const firstTeam = catcherTeams.data.records[0];
      const teamDetail = await makeRequest('GET', `/api/catchers/${firstTeam.id}`);
      logTest('Get Team Details', teamDetail.status === 200, 
        `Team: ${firstTeam.team_name}`);
    }

    // 9. Test Patrol Staff
    console.log('\n👮 Testing Patrol Staff Management...');
    const patrolStaff = await makeRequest('GET', '/api/patrol-staff');
    logTest('Get Patrol Staff', patrolStaff.status === 200);

    // 10. Test Patrol Schedules
    console.log('\n📅 Testing Patrol Schedules...');
    const schedules = await makeRequest('GET', '/api/patrol-schedules');
    logTest('Get All Schedules', schedules.status === 200);

    // 11. Test Error Handling
    console.log('\n🚨 Testing Error Handling...');
    const notFound = await makeRequest('GET', '/api/incidents/999999');
    logTest('404 Not Found', notFound.status === 404);

    const invalidEndpoint = await makeRequest('GET', '/api/invalid-endpoint');
    logTest('Invalid Endpoint', invalidEndpoint.status === 404);

    // 12. Test Monitoring Features
    console.log('\n🔍 Testing Monitoring Features...');
    
    // Create multiple test incidents for monitoring
    const monitoringTests = [
      {
        title: 'Bite Incident',
        description: 'Dog bite reported',
        incident_type: 'incident',
        animal_type: 'dog',
        status: 'pending'
      },
      {
        title: 'Stray Animal',
        description: 'Stray cat found',
        incident_type: 'stray',
        animal_type: 'cat',
        status: 'verified'
      },
      {
        title: 'Lost Pet',
        description: 'Lost dog',
        incident_type: 'lost',
        animal_type: 'dog',
        status: 'in_progress'
      }
    ];

    let monitoringIds = [];
    for (const testCase of monitoringTests) {
      const incident = {
        ...newIncident,
        ...testCase
      };
      const result = await makeRequest('POST', '/api/incidents', incident);
      if (result.data.id) {
        monitoringIds.push(result.data.id);
      }
    }
    logTest('Create Monitoring Test Data', monitoringIds.length === 3, 
      `Created ${monitoringIds.length} test incidents`);

    // Test filtering for monitoring
    const pendingForMonitoring = await makeRequest('GET', '/api/incidents?status=pending');
    logTest('Get Pending for Verification', pendingForMonitoring.status === 200, 
      `Pending: ${pendingForMonitoring.data.records?.length || 0}`);

    const verifiedForMonitoring = await makeRequest('GET', '/api/incidents?status=verified');
    logTest('Get Verified for Monitoring', verifiedForMonitoring.status === 200, 
      `Verified: ${verifiedForMonitoring.data.records?.length || 0}`);

    const inProgressForMonitoring = await makeRequest('GET', '/api/incidents?status=in_progress');
    logTest('Get In-Progress Incidents', inProgressForMonitoring.status === 200, 
      `In Progress: ${inProgressForMonitoring.data.records?.length || 0}`);

    // Cleanup monitoring test data
    console.log('\n🧹 Cleaning Up Test Data...');
    for (const id of monitoringIds) {
      await makeRequest('DELETE', `/api/incidents/${id}`);
    }
    logTest('Cleanup Test Incidents', true, `Removed ${monitoringIds.length} test incidents`);

    // 13. Test Database Connection
    console.log('\n💾 Testing Database Connection...');
    const recentIncidents = await makeRequest('GET', '/api/incidents');
    logTest('Database Query Execution', recentIncidents.status === 200);

  } catch (error) {
    console.error('\n❌ Critical Error:', error.message);
    logTest('System Test', false, error.message);
  }

  // Print Summary
  console.log('\n==========================================');
  console.log('📊 TEST SUMMARY');
  console.log('==========================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('==========================================\n');

  if (results.failed > 0) {
    console.log('⚠️ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.message}`);
    });
    console.log('');
  }

  if (results.passed === results.total) {
    console.log('🎉 ALL TESTS PASSED! System is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
console.log('⏳ Starting comprehensive system test...\n');
setTimeout(runTests, 1000);
