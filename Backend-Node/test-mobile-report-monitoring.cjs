/**
 * Comprehensive Test for Mobile Report Monitoring Display
 * Tests the complete flow from mobile submission to monitoring view display
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'bright');
  console.log('='.repeat(70) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test data simulating mobile app submission
const mobileReportData = {
  // Core incident data
  title: 'Stray Animal Report',
  description: 'Large brown dog wandering near residential area, appears friendly but hungry. Need rescue team.',
  location: '13.6218,123.1948',
  latitude: 13.6218,
  longitude: 123.1948,
  status: 'pending',
  
  // Reporter info
  reporter_name: 'Mobile Test User',
  reporter_contact: '09123456789',
  
  // Date/time
  incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
  
  // Report type
  incident_type: 'stray',
  
  // Mobile-specific animal details
  pet_color: 'Brown with white patches',
  pet_breed: 'Labrador Mix',
  animal_type: 'dog',
  pet_gender: 'male',
  pet_size: 'large',
  
  // Images (simulating already uploaded images)
  images: JSON.stringify([
    '/uploads/incident-images/test-dog-1.jpg',
    '/uploads/incident-images/test-dog-2.jpg'
  ])
};

async function testBackendConnection() {
  logSection('Testing Backend Connection');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status === 200) {
      logSuccess('Backend is running and accessible');
      return true;
    }
  } catch (error) {
    logError('Backend is not accessible');
    logError(`Error: ${error.message}`);
    return false;
  }
}

async function submitMobileReport() {
  logSection('Submitting Mobile Report');
  
  logInfo('Simulating mobile app submission...');
  logInfo('Report Data:');
  console.log(JSON.stringify({
    ...mobileReportData,
    images: JSON.parse(mobileReportData.images)
  }, null, 2));
  
  try {
    const response = await axios.post(
      `${BASE_URL}/incidents`,
      mobileReportData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success && response.data.id) {
      logSuccess(`Report submitted successfully! ID: ${response.data.id}`);
      return response.data.id;
    } else {
      logError('Report submission failed');
      console.log('Response:', response.data);
      return null;
    }
  } catch (error) {
    logError('Failed to submit mobile report');
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      console.log('Error details:', error.response.data);
    } else {
      logError(`Error: ${error.message}`);
    }
    return null;
  }
}

async function verifyReportInDatabase(reportId) {
  logSection('Verifying Report in Database');
  
  logInfo(`Fetching report #${reportId}...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/incidents/${reportId}`);
    
    if (response.data.success && response.data.data) {
      const report = response.data.data;
      
      logSuccess('Report found in database');
      logInfo('Report Details:');
      console.log(JSON.stringify(report, null, 2));
      
      // Verify all mobile fields are present
      const fieldsToCheck = [
        'pet_color',
        'pet_breed',
        'animal_type',
        'pet_gender',
        'pet_size',
        'incident_type',
        'images'
      ];
      
      logInfo('\nVerifying Mobile Fields:');
      let allFieldsPresent = true;
      
      for (const field of fieldsToCheck) {
        if (report[field] !== null && report[field] !== undefined) {
          logSuccess(`✓ ${field}: ${typeof report[field] === 'object' ? JSON.stringify(report[field]) : report[field]}`);
        } else {
          logWarning(`✗ ${field}: MISSING or NULL`);
          allFieldsPresent = false;
        }
      }
      
      // Verify images are properly parsed
      logInfo('\nVerifying Images Field:');
      if (report.images) {
        if (Array.isArray(report.images)) {
          logSuccess(`Images are properly parsed as array: ${report.images.length} image(s)`);
          report.images.forEach((img, idx) => {
            logInfo(`  Image ${idx + 1}: ${img}`);
          });
        } else if (typeof report.images === 'string') {
          logWarning('Images field is still a string (not parsed)');
          logInfo(`Raw value: ${report.images}`);
        } else {
          logError('Images field has unexpected type');
        }
      } else {
        logWarning('No images found');
      }
      
      return allFieldsPresent;
    } else {
      logError('Report not found in database');
      return false;
    }
  } catch (error) {
    logError('Failed to fetch report from database');
    if (error.response) {
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function verifyReportInMonitoringList(reportId) {
  logSection('Verifying Report in Monitoring List');
  
  logInfo('Fetching all incidents (as monitoring page would)...');
  
  try {
    const response = await axios.get(`${BASE_URL}/incidents`);
    
    if (response.data.success && response.data.records) {
      const reports = response.data.records;
      logSuccess(`Found ${reports.length} total incident(s)`);
      
      const ourReport = reports.find(r => r.id === reportId);
      
      if (ourReport) {
        logSuccess(`✓ Our mobile report (ID: ${reportId}) is in the list!`);
        
        logInfo('\nReport as it appears in monitoring list:');
        console.log(JSON.stringify(ourReport, null, 2));
        
        // Verify display fields
        logInfo('\nVerifying Display Fields:');
        const displayChecks = [
          { field: 'animal_type', expected: 'dog', label: 'Animal Type' },
          { field: 'pet_breed', expected: 'Labrador Mix', label: 'Breed' },
          { field: 'pet_color', expected: 'Brown with white patches', label: 'Color' },
          { field: 'pet_gender', expected: 'male', label: 'Gender' },
          { field: 'pet_size', expected: 'large', label: 'Size' },
          { field: 'incident_type', expected: 'stray', label: 'Report Type' }
        ];
        
        let allDisplayFieldsOk = true;
        for (const check of displayChecks) {
          if (ourReport[check.field] !== null && ourReport[check.field] !== undefined) {
            if (ourReport[check.field] === check.expected) {
              logSuccess(`✓ ${check.label}: ${ourReport[check.field]}`);
            } else {
              logWarning(`⚠ ${check.label}: ${ourReport[check.field]} (expected: ${check.expected})`);
            }
          } else {
            logError(`✗ ${check.label}: MISSING`);
            allDisplayFieldsOk = false;
          }
        }
        
        // Check images
        if (ourReport.images && Array.isArray(ourReport.images) && ourReport.images.length > 0) {
          logSuccess(`✓ Images: ${ourReport.images.length} image(s) available`);
        } else {
          logWarning('⚠ Images: Missing or not parsed correctly');
          if (ourReport.images) {
            logInfo(`Raw images value: ${JSON.stringify(ourReport.images)}`);
          }
        }
        
        return allDisplayFieldsOk;
      } else {
        logError(`✗ Report ID ${reportId} not found in monitoring list`);
        return false;
      }
    } else {
      logError('Failed to fetch incidents list');
      return false;
    }
  } catch (error) {
    logError('Failed to fetch monitoring list');
    if (error.response) {
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function cleanupTestReport(reportId) {
  logSection('Cleanup');
  
  try {
    logInfo(`Deleting test report ID: ${reportId}...`);
    await axios.delete(`${BASE_URL}/incidents/${reportId}`);
    logSuccess('Test report deleted successfully');
  } catch (error) {
    logWarning('Could not delete test report (manual cleanup may be needed)');
  }
}

async function runTests() {
  log('\n' + '█'.repeat(70), 'bright');
  log('   MOBILE REPORT MONITORING DISPLAY TEST', 'bright');
  log('█'.repeat(70) + '\n', 'bright');
  
  let reportId = null;
  let allTestsPassed = true;
  
  try {
    // Step 1: Test backend connection
    const backendOk = await testBackendConnection();
    if (!backendOk) {
      logError('\nTest aborted: Backend not accessible');
      logInfo('Please ensure the backend server is running on port 3000');
      process.exit(1);
    }
    await delay(500);
    
    // Step 2: Submit mobile report
    reportId = await submitMobileReport();
    if (!reportId) {
      logError('\nTest aborted: Could not submit report');
      allTestsPassed = false;
      process.exit(1);
    }
    await delay(1000);
    
    // Step 3: Verify in database
    const dbOk = await verifyReportInDatabase(reportId);
    if (!dbOk) {
      logWarning('\nWarning: Some database fields may be missing');
      allTestsPassed = false;
    }
    await delay(1000);
    
    // Step 4: Verify in monitoring list
    const monitoringOk = await verifyReportInMonitoringList(reportId);
    if (!monitoringOk) {
      logWarning('\nWarning: Some monitoring display fields may be missing');
      allTestsPassed = false;
    }
    await delay(1000);
    
    // Final summary
    logSection('Test Summary');
    
    if (allTestsPassed) {
      logSuccess('✓ All tests PASSED!');
      logSuccess('Mobile reports should display correctly in monitoring view');
    } else {
      logWarning('⚠ Some tests FAILED or have warnings');
      logWarning('Please review the output above for details');
    }
    
    logInfo(`\nTest Report ID: ${reportId}`);
    logInfo('You can now:');
    logInfo('1. Check the web monitoring page to visually verify the report');
    logInfo('2. Click on the marker on the map to see if details display correctly');
    logInfo('3. View the report modal to see all mobile-specific fields');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nPress ENTER to cleanup test data or CTRL+C to keep it for manual inspection...', () => {
      readline.close();
      cleanupTestReport(reportId);
    });
    
  } catch (error) {
    logError('Unexpected error during tests:');
    console.error(error);
    
    if (reportId) {
      await cleanupTestReport(reportId);
    }
  }
}

// Run the tests
runTests();
