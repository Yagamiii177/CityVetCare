/**
 * Simple Test for Mobile Emergency Report Submission
 * Uses native Node.js http module
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper to make HTTP requests
function makeRequest(url, method, data = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test 1: Health Check
async function testHealth() {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 1: Backend Health Check', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  try {
    const response = await makeRequest(`${API_BASE}/health`, 'GET');
    if (response.status === 200 && response.data.status === 'ok') {
      log('✅ Backend is running and healthy', 'green');
      return true;
    }
    log('❌ Backend health check failed', 'red');
    return false;
  } catch (error) {
    log(`❌ Cannot connect to backend: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Submit emergency report without images
async function testEmergencyReport() {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 2: Emergency Report Submission', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  const reportData = {
    title: 'Stray Animal Report',
    description: 'Test emergency report from mobile - stray dog found',
    location: '14.5995,120.9842',
    latitude: 14.5995,
    longitude: 120.9842,
    status: 'Pending',
    reporter_name: 'Test Mobile User',
    reporter_contact: '09987654321',
    incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
    incident_type: 'stray',
    pet_color: 'Brown',
    pet_breed: 'Aspin',
    animal_type: 'dog',
    pet_gender: 'Male',
    pet_size: 'Medium',
    images: [] // No images for simple test
  };
  
  try {
    log('📤 Submitting emergency report...', 'blue');
    const response = await makeRequest(`${API_BASE}/incidents`, 'POST', reportData);
    
    if (response.status === 201 && response.data.success && response.data.id) {
      log('✅ Report submitted successfully!', 'green');
      log(`   Report ID: ${response.data.id}`, 'green');
      return response.data.id;
    }
    
    log('❌ Report submission failed', 'red');
    log(`   Status: ${response.status}`, 'yellow');
    log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
    return null;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
}

// Test 3: Verify in database
async function testDatabaseVerification(reportId) {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 3: Database Verification', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  try {
    log(`🔍 Fetching report ${reportId}...`, 'blue');
    const response = await makeRequest(`${API_BASE}/incidents/${reportId}`, 'GET');
    
    if (response.status === 200 && response.data.success && response.data.data) {
      log('✅ Report found in database!', 'green');
      const report = response.data.data;
      log('\n📋 Report Details:', 'cyan');
      log(`   ID: ${report.id}`, 'blue');
      log(`   Type: ${report.report_type}`, 'blue');
      log(`   Status: ${report.status}`, 'blue');
      log(`   Reporter: ${report.reporter_name}`, 'blue');
      log(`   Contact: ${report.reporter_contact}`, 'blue');
      log(`   Animal: ${report.animal_type} - ${report.pet_breed}`, 'blue');
      log(`   Location: ${report.latitude}, ${report.longitude}`, 'blue');
      return true;
    }
    
    log('❌ Report not found', 'red');
    return false;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Verify in monitoring list
async function testMonitoringList() {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 4: Monitoring List Verification', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  try {
    log('🔍 Fetching all incidents...', 'blue');
    const response = await makeRequest(`${API_BASE}/incidents`, 'GET');
    
    if (response.status === 200 && response.data.success) {
      log(`✅ Found ${response.data.records.length} total incidents`, 'green');
      
      const testReport = response.data.records.find(r => 
        r.reporter_contact === '09987654321'
      );
      
      if (testReport) {
        log('✅ Test report appears in monitoring!', 'green');
        log('   Report will be visible in web dashboard', 'green');
        return true;
      }
      
      log('⚠️  Test report not found in list', 'yellow');
      return false;
    }
    
    log('❌ Failed to fetch incidents', 'red');
    return false;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('\n╔═══════════════════════════════════════╗', 'cyan');
  log('║  Mobile Emergency Report Test Suite  ║', 'cyan');
  log('╚═══════════════════════════════════════╝', 'cyan');
  
  // Test 1: Health
  const healthOk = await testHealth();
  if (!healthOk) {
    log('\n❌ ABORTED: Backend not running', 'red');
    log('   Start backend: cd Backend-Node && npm start', 'yellow');
    return;
  }
  
  // Test 2: Submit Report
  const reportId = await testEmergencyReport();
  if (!reportId) {
    log('\n❌ ABORTED: Could not submit report', 'red');
    return;
  }
  
  // Wait a moment for database
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Database Check
  const dbOk = await testDatabaseVerification(reportId);
  
  // Test 4: Monitoring Check
  const monitoringOk = await testMonitoringList();
  
  // Summary
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  const results = {
    'Backend Health': healthOk,
    'Report Submission': reportId !== null,
    'Database Storage': dbOk,
    'Monitoring Display': monitoringOk
  };
  
  Object.entries(results).forEach(([test, passed]) => {
    log(`${passed ? '✅' : '❌'} ${test}`, passed ? 'green' : 'red');
  });
  
  const passedCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  log(`\n${passedCount}/${totalCount} tests passed\n`, passedCount === totalCount ? 'green' : 'yellow');
  
  if (passedCount === totalCount) {
    log('🎉 ALL TESTS PASSED!', 'green');
    log('\n✅ Mobile emergency reports are working correctly:', 'green');
    log('   • Reports are stored in database', 'green');
    log('   • Reports appear in web monitoring', 'green');
    log('   • No login required (emergency feature)', 'green');
    log('\n📱 You can now test on your mobile device!', 'cyan');
  } else {
    log('⚠️  SOME TESTS FAILED - Review errors above', 'yellow');
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
