// API Endpoint Testing Script
// Run this in the browser console to test the fixed endpoints

const API_BASE = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Starting API Endpoint Tests...\n');
  
  const results = {
    passed: [],
    failed: []
  };
  
  // Test 1: Get all incidents
  try {
    console.log('📋 Test 1: GET /api/incidents');
    const response = await fetch(`${API_BASE}/incidents`);
    const data = await response.json();
    if (response.ok) {
      console.log('✅ PASS - Got', data.records?.length || 0, 'incidents');
      results.passed.push('GET /api/incidents');
    } else {
      console.error('❌ FAIL -', data.message);
      results.failed.push('GET /api/incidents');
    }
  } catch (error) {
    console.error('❌ FAIL -', error.message);
    results.failed.push('GET /api/incidents');
  }
  
  // Test 2: Get incident by ID (if any exists)
  try {
    console.log('\n📋 Test 2: GET /api/incidents/:id');
    const listResponse = await fetch(`${API_BASE}/incidents`);
    const listData = await listResponse.json();
    
    if (listData.records && listData.records.length > 0) {
      const testId = listData.records[0].id;
      const response = await fetch(`${API_BASE}/incidents/${testId}`);
      const data = await response.json();
      
      if (response.ok && data.id) {
        console.log('✅ PASS - Got incident #', data.id);
        results.passed.push('GET /api/incidents/:id');
      } else {
        console.error('❌ FAIL -', data.message || 'No data returned');
        results.failed.push('GET /api/incidents/:id');
      }
    } else {
      console.log('⚠️ SKIP - No incidents to test');
    }
  } catch (error) {
    console.error('❌ FAIL -', error.message);
    results.failed.push('GET /api/incidents/:id');
  }
  
  // Test 3: Get status counts
  try {
    console.log('\n📋 Test 3: GET /api/incidents/status-counts');
    const response = await fetch(`${API_BASE}/incidents/status-counts`);
    const data = await response.json();
    if (response.ok) {
      console.log('✅ PASS - Status counts:', data.data?.length || 0, 'statuses');
      results.passed.push('GET /api/incidents/status-counts');
    } else {
      console.error('❌ FAIL -', data.message);
      results.failed.push('GET /api/incidents/status-counts');
    }
  } catch (error) {
    console.error('❌ FAIL -', error.message);
    results.failed.push('GET /api/incidents/status-counts');
  }
  
  // Test 4: Get all catchers
  try {
    console.log('\n📋 Test 4: GET /api/catchers');
    const response = await fetch(`${API_BASE}/catchers`);
    const data = await response.json();
    if (response.ok) {
      console.log('✅ PASS - Got', data.records?.length || 0, 'catcher teams');
      results.passed.push('GET /api/catchers');
    } else {
      console.error('❌ FAIL -', data.message);
      results.failed.push('GET /api/catchers');
    }
  } catch (error) {
    console.error('❌ FAIL -', error.message);
    results.failed.push('GET /api/catchers');
  }
  
  // Test 5: Get all patrol staff
  try {
    console.log('\n📋 Test 5: GET /api/patrol-staff');
    const response = await fetch(`${API_BASE}/patrol-staff`);
    const data = await response.json();
    if (response.ok) {
      console.log('✅ PASS - Got', data.records?.length || 0, 'patrol staff');
      results.passed.push('GET /api/patrol-staff');
    } else {
      console.error('❌ FAIL -', data.message);
      results.failed.push('GET /api/patrol-staff');
    }
  } catch (error) {
    console.error('❌ FAIL -', error.message);
    results.failed.push('GET /api/patrol-staff');
  }
  
  // Test 6: Get all patrol schedules
  try {
    console.log('\n📋 Test 6: GET /api/patrol-schedules');
    const response = await fetch(`${API_BASE}/patrol-schedules`);
    const data = await response.json();
    if (response.ok) {
      console.log('✅ PASS - Got', data.records?.length || 0, 'patrol schedules');
      results.passed.push('GET /api/patrol-schedules');
    } else {
      console.error('❌ FAIL -', data.message);
      results.failed.push('GET /api/patrol-schedules');
    }
  } catch (error) {
    console.error('❌ FAIL -', error.message);
    results.failed.push('GET /api/patrol-schedules');
  }
  
  // Test 7: Get dashboard stats
  try {
    console.log('\n📋 Test 7: GET /api/dashboard');
    const response = await fetch(`${API_BASE}/dashboard`);
    const data = await response.json();
    if (response.ok) {
      console.log('✅ PASS - Got dashboard stats');
      results.passed.push('GET /api/dashboard');
    } else {
      console.error('❌ FAIL -', data.message);
      results.failed.push('GET /api/dashboard');
    }
  } catch (error) {
    console.error('❌ FAIL -', error.message);
    results.failed.push('GET /api/dashboard');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📊 Total: ${results.passed.length + results.failed.length}`);
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`   - ${test}`));
  }
  
  console.log('\n' + '='.repeat(50));
  
  return results;
}

// Run the tests
testEndpoints();

console.log(`
🔍 MANUAL UPDATE TEST:

To test UPDATE endpoint:
1. Open the admin web (http://localhost:5173)
2. Go to "Pending Verification" page
3. Click "Verify" on any pending report
4. Check browser DevTools Network tab
5. You should see: PUT http://localhost:3000/api/incidents/[id]
6. Response should be 200 OK

To test in console:
----------------
const testUpdate = async () => {
  // Get first incident
  const incidents = await fetch('http://localhost:3000/api/incidents').then(r => r.json());
  const incident = incidents.records[0];
  
  // Update status to verified
  const response = await fetch(\`http://localhost:3000/api/incidents/\${incident.id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: incident.title,
      description: incident.description,
      location: incident.location,
      latitude: incident.latitude,
      longitude: incident.longitude,
      status: 'verified',
      priority: incident.priority,
      assigned_catcher_id: incident.assigned_catcher_id
    })
  });
  
  console.log('Update Response:', await response.json());
};

testUpdate();
`);
