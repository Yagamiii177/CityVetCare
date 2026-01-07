/**
 * Admin Monitoring Features Test
 * Tests all admin panel features including:
 * - Pending Verification
 * - Incident Monitoring
 * - Status Management
 * - Report Details
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:3000');
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

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: []
};

function logTest(name, passed, message = '') {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`  ✅ ${name}`);
    if (message) console.log(`     ${message}`);
  } else {
    results.failed++;
    console.log(`  ❌ ${name}`);
    if (message) console.log(`     Error: ${message}`);
  }
}

function logWarning(message) {
  results.warnings.push(message);
  console.log(`  ⚠️  ${message}`);
}

async function testAdminMonitoring() {
  console.log('\n🔍 ADMIN MONITORING FEATURES TEST');
  console.log('=====================================\n');

  try {
    // Setup: Create test incidents
    console.log('📋 SETUP: Creating Test Incidents...');
    const testIncidents = [];
    
    const incidentTypes = [
      {
        title: 'Dog Bite Incident',
        description: 'Patient bitten by stray dog',
        incident_type: 'incident',
        animal_type: 'dog',
        pet_breed: 'Unknown',
        pet_color: 'Brown',
        pet_gender: 'unknown',
        pet_size: 'large',
        status: 'pending'
      },
      {
        title: 'Stray Cat Report',
        description: 'Multiple stray cats in residential area',
        incident_type: 'stray',
        animal_type: 'cat',
        pet_breed: 'Mixed',
        pet_color: 'Gray',
        pet_gender: 'female',
        pet_size: 'small',
        status: 'pending'
      },
      {
        title: 'Lost Pet - Golden Retriever',
        description: 'Lost golden retriever named Max',
        incident_type: 'lost',
        animal_type: 'dog',
        pet_breed: 'Golden Retriever',
        pet_color: 'Golden',
        pet_gender: 'male',
        pet_size: 'large',
        status: 'pending'
      },
      {
        title: 'Verified Stray Dog',
        description: 'Already verified stray dog case',
        incident_type: 'stray',
        animal_type: 'dog',
        pet_breed: 'Mixed Breed',
        pet_color: 'Black',
        pet_gender: 'male',
        pet_size: 'medium',
        status: 'verified'
      },
      {
        title: 'In Progress - Rescue Mission',
        description: 'Rescue mission in progress',
        incident_type: 'stray',
        animal_type: 'dog',
        pet_breed: 'Aspin',
        pet_color: 'Brown',
        pet_gender: 'male',
        pet_size: 'medium',
        status: 'in_progress'
      }
    ];

    for (const incident of incidentTypes) {
      const fullIncident = {
        ...incident,
        location: 'Test Location, City',
        latitude: 13.6218 + (Math.random() * 0.1 - 0.05),
        longitude: 123.1948 + (Math.random() * 0.1 - 0.05),
        incident_date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
        reporter_name: 'Test Reporter',
        reporter_contact: '09123456789',
        images: []
      };

      const result = await makeRequest('POST', '/api/incidents', fullIncident);
      if (result.status === 201 && result.data.id) {
        testIncidents.push({ ...fullIncident, id: result.data.id });
        console.log(`  ✓ Created ${incident.status} ${incident.incident_type} (ID: ${result.data.id})`);
      }
    }
    console.log(`\n  Created ${testIncidents.length} test incidents\n`);

    // Test 1: Pending Verification Page
    console.log('📝 TEST 1: PENDING VERIFICATION');
    console.log('─────────────────────────────────');
    
    const pending = await makeRequest('GET', '/api/incidents?status=pending');
    logTest('Fetch Pending Reports', pending.status === 200, 
      `Found ${pending.data.records?.length || 0} pending reports`);
    
    if (pending.data.records && pending.data.records.length > 0) {
      logTest('Pending Reports Have Required Fields', 
        pending.data.records[0].hasOwnProperty('incident_type') &&
        pending.data.records[0].hasOwnProperty('status') &&
        pending.data.records[0].hasOwnProperty('reporter_name'),
        'All required fields present'
      );
      
      // Check mobile fields
      const firstPending = pending.data.records[0];
      const hasMobileFields = firstPending.pet_breed !== undefined || 
                               firstPending.pet_color !== undefined ||
                               firstPending.animal_type !== undefined;
      logTest('Mobile Report Fields Present', hasMobileFields,
        `Breed: ${firstPending.pet_breed}, Color: ${firstPending.pet_color}, Type: ${firstPending.animal_type}`
      );
    } else {
      logWarning('No pending reports found (expected at least 3)');
    }

    // Test 2: Approve Report (Verify)
    console.log('\n✅ TEST 2: APPROVE/VERIFY REPORT');
    console.log('─────────────────────────────────');
    
    const pendingToApprove = testIncidents.find(t => t.status === 'pending' && t.incident_type === 'incident');
    if (pendingToApprove) {
      const approveData = {
        ...pendingToApprove,
        status: 'verified'
      };
      const approved = await makeRequest('PUT', `/api/incidents/${pendingToApprove.id}`, approveData);
      logTest('Approve Pending Report', approved.status === 200);
      
      // Verify status change
      const check = await makeRequest('GET', `/api/incidents/${pendingToApprove.id}`);
      logTest('Status Changed to Verified', 
        check.data.data?.status === 'verified',
        `Status: ${check.data.data?.status}`
      );
    }

    // Test 3: Reject Report
    console.log('\n❌ TEST 3: REJECT REPORT');
    console.log('─────────────────────────────────');
    
    const pendingToReject = testIncidents.find(t => t.status === 'pending' && t.incident_type === 'stray');
    if (pendingToReject) {
      const rejectData = {
        ...pendingToReject,
        status: 'rejected',
        description: pendingToReject.description + ' [REJECTED: Invalid report]'
      };
      const rejected = await makeRequest('PUT', `/api/incidents/${pendingToReject.id}`, rejectData);
      logTest('Reject Report', rejected.status === 200);
      
      // Verify rejection
      const check = await makeRequest('GET', `/api/incidents/${pendingToReject.id}`);
      logTest('Status Changed to Rejected', 
        check.data.data?.status === 'rejected',
        `Status: ${check.data.data?.status}`
      );
    }

    // Test 4: Incident Monitoring Page
    console.log('\n📊 TEST 4: INCIDENT MONITORING');
    console.log('─────────────────────────────────');
    
    // Get active incidents (excluding rejected, cancelled, resolved)
    const allIncidents = await makeRequest('GET', '/api/incidents');
    logTest('Fetch All Incidents', allIncidents.status === 200,
      `Total: ${allIncidents.data.records?.length || 0}`
    );
    
    const activeStatuses = ['pending', 'verified', 'in_progress'];
    const activeIncidents = allIncidents.data.records?.filter(inc => 
      activeStatuses.includes(inc.status.toLowerCase())
    ) || [];
    
    logTest('Filter Active Incidents', activeIncidents.length > 0,
      `Active incidents: ${activeIncidents.length}`
    );

    // Test 5: Get Report Details
    console.log('\n🔎 TEST 5: VIEW REPORT DETAILS');
    console.log('─────────────────────────────────');
    
    if (testIncidents.length > 0) {
      const testId = testIncidents[0].id;
      const details = await makeRequest('GET', `/api/incidents/${testId}`);
      
      logTest('Get Single Report Details', details.status === 200);
      
      if (details.status === 200 && details.data.data) {
        const report = details.data.data;
        logTest('Report Has Complete Data', 
          report.title && report.description && report.location,
          `Title: ${report.title}`
        );
        
        logTest('Report Has Animal Details',
          report.pet_breed !== undefined && report.pet_color !== undefined,
          `${report.animal_type} - ${report.pet_breed} (${report.pet_color})`
        );
        
        logTest('Report Has Reporter Info',
          report.reporter_name && report.reporter_contact,
          `Reporter: ${report.reporter_name}`
        );
        
        logTest('Report Has Location Data',
          report.location && (report.latitude !== null || report.longitude !== null),
          `Location: ${report.location}`
        );
        
        logTest('Report Has Images Field',
          Array.isArray(report.images),
          `Images: ${report.images?.length || 0}`
        );
      }
    }

    // Test 6: Status Progression
    console.log('\n🔄 TEST 6: STATUS WORKFLOW');
    console.log('─────────────────────────────────');
    
    const workflowTest = testIncidents.find(t => t.status === 'verified');
    if (workflowTest) {
      // Verified -> In Progress
      const toInProgress = await makeRequest('PUT', `/api/incidents/${workflowTest.id}`, {
        ...workflowTest,
        status: 'in_progress'
      });
      logTest('Update Verified to In Progress', toInProgress.status === 200);
      
      // In Progress -> Resolved
      const toResolved = await makeRequest('PUT', `/api/incidents/${workflowTest.id}`, {
        ...workflowTest,
        status: 'resolved'
      });
      logTest('Update In Progress to Resolved', toResolved.status === 200);
      
      // Check final status
      const finalCheck = await makeRequest('GET', `/api/incidents/${workflowTest.id}`);
      logTest('Verify Final Status', 
        finalCheck.data.data?.status === 'resolved',
        `Final status: ${finalCheck.data.data?.status}`
      );
    }

    // Test 7: Filter by Incident Type
    console.log('\n🏷️  TEST 7: FILTER BY TYPE');
    console.log('─────────────────────────────────');
    
    const biteIncidents = await makeRequest('GET', '/api/incidents?incident_type=incident');
    logTest('Filter Bite Incidents', biteIncidents.status === 200,
      `Found ${biteIncidents.data.records?.length || 0} bite incidents`
    );
    
    const strays = await makeRequest('GET', '/api/incidents?incident_type=stray');
    logTest('Filter Stray Animals', strays.status === 200,
      `Found ${strays.data.records?.length || 0} stray animals`
    );
    
    const lostPets = await makeRequest('GET', '/api/incidents?incident_type=lost');
    logTest('Filter Lost Pets', lostPets.status === 200,
      `Found ${lostPets.data.records?.length || 0} lost pets`
    );

    // Test 8: Dashboard Statistics
    console.log('\n📈 TEST 8: DASHBOARD STATISTICS');
    console.log('─────────────────────────────────');
    
    const dashboard = await makeRequest('GET', '/api/dashboard');
    logTest('Fetch Dashboard Stats', dashboard.status === 200);
    
    if (dashboard.status === 200 && dashboard.data.summary) {
      const stats = dashboard.data.summary;
      logTest('Dashboard Has Incident Counts',
        stats.total_incidents !== undefined &&
        stats.pending_incidents !== undefined &&
        stats.verified_incidents !== undefined,
        `Total: ${stats.total_incidents}, Pending: ${stats.pending_incidents}, Verified: ${stats.verified_incidents || 0}`
      );
      
      logTest('Dashboard Has Other Stats',
        stats.total_catcher_teams !== undefined,
        `Catcher Teams: ${stats.total_catcher_teams}`
      );
    }

    // Test 9: Status Counts Endpoint
    console.log('\n📊 TEST 9: STATUS COUNTS');
    console.log('─────────────────────────────────');
    
    const statusCounts = await makeRequest('GET', '/api/incidents/status-counts');
    logTest('Fetch Status Counts', statusCounts.status === 200);
    
    if (statusCounts.status === 200 && statusCounts.data.data) {
      const counts = statusCounts.data.data;
      logTest('Has Count Data', Array.isArray(counts) && counts.length > 0,
        `${counts.length} status types found`
      );
    }

    // Test 10: Search Functionality
    console.log('\n🔍 TEST 10: SEARCH FUNCTIONALITY');
    console.log('─────────────────────────────────');
    
    const searchDog = await makeRequest('GET', '/api/incidents?search=dog');
    logTest('Search for "dog"', searchDog.status === 200,
      `Results: ${searchDog.data.records?.length || 0}`
    );
    
    const searchBite = await makeRequest('GET', '/api/incidents?search=bite');
    logTest('Search for "bite"', searchBite.status === 200,
      `Results: ${searchBite.data.records?.length || 0}`
    );

    // Cleanup: Delete test incidents
    console.log('\n🧹 CLEANUP: Removing Test Data...');
    for (const incident of testIncidents) {
      await makeRequest('DELETE', `/api/incidents/${incident.id}`);
    }
    console.log(`  ✓ Removed ${testIncidents.length} test incidents\n`);

  } catch (error) {
    console.error('\n❌ Critical Error:', error.message);
    logTest('Test Execution', false, error.message);
  }

  // Print Summary
  console.log('=====================================');
  console.log('📊 TEST SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('=====================================\n');

  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    results.warnings.forEach(w => console.log(`   - ${w}`));
    console.log('');
  }

  if (results.passed === results.total) {
    console.log('🎉 ALL ADMIN MONITORING FEATURES WORKING!');
    console.log('✓ Pending Verification: OK');
    console.log('✓ Incident Monitoring: OK');
    console.log('✓ Status Management: OK');
    console.log('✓ Report Details: OK');
    console.log('✓ Filtering & Search: OK');
    console.log('✓ Dashboard Stats: OK');
  } else {
    console.log('⚠️ Some tests failed. Please review issues above.');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

console.log('⏳ Starting admin monitoring test...');
setTimeout(testAdminMonitoring, 1000);
