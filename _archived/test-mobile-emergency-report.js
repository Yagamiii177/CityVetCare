/**
 * Test Mobile Emergency Report Submission
 * This simulates how the mobile app submits emergency reports (without login)
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3000/api';

// ANSI colors for console
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

// Test 1: Check backend health
async function testBackendHealth() {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 1: Backend Health Check', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'ok') {
      log('✅ Backend is running and healthy', 'green');
      return true;
    } else {
      log('❌ Backend health check failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Cannot connect to backend: ${error.message}`, 'red');
    log('   Make sure backend is running on port 3000', 'yellow');
    return false;
  }
}

// Test 2: Upload test image
async function testImageUpload() {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 2: Image Upload', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const formData = new FormData();
    formData.append('images', testImageBuffer, {
      filename: 'test-incident.png',
      contentType: 'image/png'
    });
    
    log('📤 Uploading test image...', 'blue');
    const response = await fetch(`${API_BASE}/incidents/upload-images`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.images && data.images.length > 0) {
      log('✅ Image uploaded successfully', 'green');
      log(`   Image URL: ${data.images[0]}`, 'blue');
      return data.images[0];
    } else {
      log('❌ Image upload failed', 'red');
      log(`   Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Image upload error: ${error.message}`, 'red');
    return null;
  }
}

// Test 3: Submit emergency report (like mobile app does)
async function testEmergencyReportSubmission(imageUrl) {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 3: Emergency Report Submission', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  const reportData = {
    title: 'Stray Animal Report',
    description: 'Test emergency report from mobile app - stray dog found in the area',
    location: '14.5995,120.9842',
    latitude: 14.5995,
    longitude: 120.9842,
    status: 'Pending',
    reporter_name: 'Mobile Test User',
    reporter_contact: '09123456789',
    incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
    incident_type: 'stray',
    pet_color: 'Brown',
    pet_breed: 'Aspin',
    animal_type: 'dog',
    pet_gender: 'Male',
    pet_size: 'Medium',
    images: imageUrl ? [imageUrl] : [] // Send as array
  };
  
  try {
    log('📤 Submitting emergency report...', 'blue');
    log('   Report Type: Stray Animal', 'blue');
    log('   Has Image: ' + (imageUrl ? 'Yes' : 'No'), 'blue');
    
    const response = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.id) {
      log('✅ Report submitted successfully!', 'green');
      log(`   Report ID: ${data.id}`, 'green');
      return data.id;
    } else {
      log('❌ Report submission failed', 'red');
      log(`   Status: ${response.status}`, 'yellow');
      log(`   Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Report submission error: ${error.message}`, 'red');
    return null;
  }
}

// Test 4: Verify report appears in database
async function testReportInDatabase(reportId) {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 4: Verify Report in Database', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  try {
    log('🔍 Fetching report from database...', 'blue');
    const response = await fetch(`${API_BASE}/incidents/${reportId}`);
    const data = await response.json();
    
    if (response.ok && data.success && data.data) {
      log('✅ Report found in database!', 'green');
      log('\n📋 Report Details:', 'cyan');
      log(`   Report ID: ${data.data.id}`, 'blue');
      log(`   Type: ${data.data.report_type}`, 'blue');
      log(`   Status: ${data.data.status}`, 'blue');
      log(`   Reporter: ${data.data.reporter_name}`, 'blue');
      log(`   Contact: ${data.data.reporter_contact}`, 'blue');
      log(`   Animal: ${data.data.animal_type} - ${data.data.pet_breed} (${data.data.pet_color})`, 'blue');
      log(`   Location: ${data.data.location}`, 'blue');
      log(`   Images: ${data.data.images?.length || 0} image(s)`, 'blue');
      if (data.data.images && data.data.images.length > 0) {
        data.data.images.forEach((img, idx) => {
          log(`     ${idx + 1}. ${img}`, 'blue');
        });
      }
      return true;
    } else {
      log('❌ Report not found in database', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Database check error: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Verify report appears in all incidents list
async function testReportInMonitoring() {
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST 5: Verify Report in Monitoring', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  try {
    log('🔍 Fetching all incidents...', 'blue');
    const response = await fetch(`${API_BASE}/incidents`);
    const data = await response.json();
    
    if (response.ok && data.success && data.records) {
      log(`✅ Found ${data.records.length} total incidents`, 'green');
      
      // Look for our test report (most recent one)
      const testReport = data.records.find(r => 
        r.reporter_contact === '09123456789' && 
        r.reporter_name === 'Mobile Test User'
      );
      
      if (testReport) {
        log('✅ Test report appears in monitoring list!', 'green');
        log(`   Report will be visible in web dashboard`, 'green');
        return true;
      } else {
        log('⚠️  Test report not found in monitoring list', 'yellow');
        return false;
      }
    } else {
      log('❌ Failed to fetch incidents list', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Monitoring check error: ${error.message}`, 'red');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('\n╔═══════════════════════════════════════╗', 'cyan');
  log('║  Mobile Emergency Report Test Suite  ║', 'cyan');
  log('╚═══════════════════════════════════════╝', 'cyan');
  
  const results = {
    health: false,
    imageUpload: false,
    reportSubmission: false,
    databaseVerification: false,
    monitoringVerification: false
  };
  
  // Test 1: Backend Health
  results.health = await testBackendHealth();
  if (!results.health) {
    log('\n❌ TESTS ABORTED: Backend is not running', 'red');
    return;
  }
  
  // Test 2: Image Upload
  const imageUrl = await testImageUpload();
  results.imageUpload = imageUrl !== null;
  
  // Test 3: Report Submission
  const reportId = await testEmergencyReportSubmission(imageUrl);
  results.reportSubmission = reportId !== null;
  
  if (reportId) {
    // Test 4: Database Verification
    results.databaseVerification = await testReportInDatabase(reportId);
    
    // Test 5: Monitoring Verification
    results.monitoringVerification = await testReportInMonitoring();
  }
  
  // Summary
  log('\n═══════════════════════════════════════', 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  
  const totalTests = 5;
  const passedTests = Object.values(results).filter(r => r).length;
  
  log(`\n✓ Backend Health:            ${results.health ? '✅ PASS' : '❌ FAIL'}`, results.health ? 'green' : 'red');
  log(`✓ Image Upload:              ${results.imageUpload ? '✅ PASS' : '❌ FAIL'}`, results.imageUpload ? 'green' : 'red');
  log(`✓ Report Submission:         ${results.reportSubmission ? '✅ PASS' : '❌ FAIL'}`, results.reportSubmission ? 'green' : 'red');
  log(`✓ Database Verification:     ${results.databaseVerification ? '✅ PASS' : '❌ FAIL'}`, results.databaseVerification ? 'green' : 'red');
  log(`✓ Monitoring Verification:   ${results.monitoringVerification ? '✅ PASS' : '❌ FAIL'}`, results.monitoringVerification ? 'green' : 'red');
  
  log(`\n${passedTests}/${totalTests} tests passed\n`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 ALL TESTS PASSED! Mobile emergency reports are working correctly!', 'green');
    log('   ✓ Reports are stored in database', 'green');
    log('   ✓ Reports appear in web monitoring', 'green');
    log('   ✓ Images are uploaded and linked', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED - Check the errors above', 'yellow');
  }
}

// Run the tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
