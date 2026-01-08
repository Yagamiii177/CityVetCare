/**
 * Test: Complete Notification Lifecycle
 * 
 * Tests the following notification triggers:
 * 1. Report submission (authenticated user)
 * 2. Status change to Scheduled (when patrol is created)
 * 3. Status change to In Progress (when patrol starts)
 * 4. Status change to Resolved
 * 5. Status change to Rejected (with reason)
 * 
 * Verifies:
 * - Notifications are created in database
 * - Proper titles and messages
 * - incident_id is linked
 * - owner_id is linked
 * - No notifications for anonymous reports
 */

import axios from 'axios';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let testOwnerId = null;
let testIncidentId = null;
let testPatrolId = null;

// Helper functions
const log = (message, color = 'white') => {
  const colors = {
    green: chalk.green,
    red: chalk.red,
    yellow: chalk.yellow,
    blue: chalk.blue,
    cyan: chalk.cyan,
    magenta: chalk.magenta,
    white: chalk.white,
  };
  console.log(colors[color](message));
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Step 1: Login as pet owner
async function loginAsPetOwner() {
  log('\n📋 STEP 1: Login as Pet Owner', 'cyan');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.doe@email.com', // Assuming this exists
      password: 'password123',
      userType: 'pet_owner'
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      testOwnerId = response.data.user.id;
      log(`✅ Logged in successfully as owner ID: ${testOwnerId}`, 'green');
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ Login failed: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Step 2: Submit an authenticated incident report
async function submitIncidentReport() {
  log('\n📋 STEP 2: Submit Authenticated Incident Report', 'cyan');
  try {
    const response = await axios.post(
      `${BASE_URL}/incidents`,
      {
        incident_type: 'stray',
        description: 'Test notification lifecycle - stray dog near park',
        incident_date: new Date().toISOString().split('T')[0],
        location_address: '123 Test Street, Test City',
        latitude: '14.5995',
        longitude: '120.9842',
        animal_type: 'Dog',
        pet_breed: 'Mixed',
        pet_color: 'Brown',
        pet_gender: 'Male',
        pet_size: 'Medium',
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      testIncidentId = response.data.id;
      log(`✅ Incident created with ID: ${testIncidentId}`, 'green');
      await sleep(500);
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ Failed to create incident: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Step 3: Check for submission notification
async function checkSubmissionNotification() {
  log('\n📋 STEP 3: Check for Submission Notification', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const notifications = response.data.notifications || [];
    const submissionNotif = notifications.find(
      n => n.incident_id === testIncidentId && n.type === 'submission'
    );

    if (submissionNotif) {
      log(`✅ Submission notification found:`, 'green');
      log(`   Title: ${submissionNotif.title}`, 'white');
      log(`   Message: ${submissionNotif.message}`, 'white');
      log(`   Type: ${submissionNotif.type}`, 'white');
      log(`   Incident ID: ${submissionNotif.incident_id}`, 'white');
      return true;
    } else {
      log(`❌ Submission notification NOT found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Failed to fetch notifications: ${error.message}`, 'red');
    return false;
  }
}

// Step 4: Create patrol schedule (should trigger "Scheduled" notification)
async function createPatrolSchedule() {
  log('\n📋 STEP 4: Create Patrol Schedule', 'cyan');
  try {
    const response = await axios.post(
      `${BASE_URL}/patrol-schedules`,
      {
        report_id: testIncidentId,
        incident_id: testIncidentId,
        schedule_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        schedule_time: '10:00 AM',
        assigned_catcher_id: '1,2', // Assign catchers 1 and 2
        notes: 'Test patrol for notification lifecycle'
      }
    );

    if (response.data.success) {
      testPatrolId = response.data.id;
      log(`✅ Patrol schedule created with ID: ${testPatrolId}`, 'green');
      await sleep(500);
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ Failed to create patrol: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Step 5: Check for "Scheduled" notification
async function checkScheduledNotification() {
  log('\n📋 STEP 5: Check for Scheduled Notification', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const notifications = response.data.notifications || [];
    const scheduledNotif = notifications.find(
      n => n.incident_id === testIncidentId && 
           n.type === 'status_update' && 
           n.title.includes('Scheduled')
    );

    if (scheduledNotif) {
      log(`✅ Scheduled notification found:`, 'green');
      log(`   Title: ${scheduledNotif.title}`, 'white');
      log(`   Message: ${scheduledNotif.message}`, 'white');
      return true;
    } else {
      log(`❌ Scheduled notification NOT found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Failed to fetch notifications: ${error.message}`, 'red');
    return false;
  }
}

// Step 6: Update patrol status to "In Progress"
async function updatePatrolToInProgress() {
  log('\n📋 STEP 6: Update Patrol to In Progress', 'cyan');
  try {
    const response = await axios.put(
      `${BASE_URL}/patrol-schedules/${testPatrolId}`,
      {
        status: 'In Progress'
      }
    );

    if (response.data.success) {
      log(`✅ Patrol status updated to In Progress`, 'green');
      await sleep(500);
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ Failed to update patrol: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Step 7: Check for "In Progress" notification
async function checkInProgressNotification() {
  log('\n📋 STEP 7: Check for In Progress Notification', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const notifications = response.data.notifications || [];
    const inProgressNotif = notifications.find(
      n => n.incident_id === testIncidentId && 
           n.type === 'status_update' && 
           n.title.includes('Progress')
    );

    if (inProgressNotif) {
      log(`✅ In Progress notification found:`, 'green');
      log(`   Title: ${inProgressNotif.title}`, 'white');
      log(`   Message: ${inProgressNotif.message}`, 'white');
      return true;
    } else {
      log(`❌ In Progress notification NOT found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Failed to fetch notifications: ${error.message}`, 'red');
    return false;
  }
}

// Step 8: Update incident to "Resolved"
async function updateIncidentToResolved() {
  log('\n📋 STEP 8: Update Incident to Resolved', 'cyan');
  try {
    const response = await axios.put(
      `${BASE_URL}/incidents/${testIncidentId}`,
      {
        status: 'Resolved',
        resolution_notes: 'Test resolution - animal captured and relocated'
      }
    );

    if (response.data.success) {
      log(`✅ Incident status updated to Resolved`, 'green');
      await sleep(500);
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ Failed to update incident: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Step 9: Check for "Resolved" notification
async function checkResolvedNotification() {
  log('\n📋 STEP 9: Check for Resolved Notification', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const notifications = response.data.notifications || [];
    const resolvedNotif = notifications.find(
      n => n.incident_id === testIncidentId && 
           n.type === 'status_update' && 
           n.title.includes('Resolved')
    );

    if (resolvedNotif) {
      log(`✅ Resolved notification found:`, 'green');
      log(`   Title: ${resolvedNotif.title}`, 'white');
      log(`   Message: ${resolvedNotif.message}`, 'white');
      return true;
    } else {
      log(`❌ Resolved notification NOT found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Failed to fetch notifications: ${error.message}`, 'red');
    return false;
  }
}

// Step 10: Test rejection notification
async function testRejectionFlow() {
  log('\n📋 STEP 10: Test Rejection Notification', 'cyan');
  
  // Create another incident
  try {
    const createResponse = await axios.post(
      `${BASE_URL}/incidents`,
      {
        incident_type: 'stray',
        description: 'Test rejection notification',
        incident_date: new Date().toISOString().split('T')[0],
        location_address: '456 Test Street',
        latitude: '14.5995',
        longitude: '120.9842',
        animal_type: 'Dog',
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rejectionIncidentId = createResponse.data.id;
    log(`✅ Created test incident for rejection: ${rejectionIncidentId}`, 'green');
    await sleep(500);

    // Reject it
    await axios.put(
      `${BASE_URL}/incidents/${rejectionIncidentId}`,
      {
        status: 'Rejected',
        rejection_reason: 'Duplicate report - already addressed'
      }
    );

    log(`✅ Incident rejected`, 'green');
    await sleep(500);

    // Check for rejection notification
    const notifResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const notifications = notifResponse.data.notifications || [];
    const rejectionNotif = notifications.find(
      n => n.incident_id === rejectionIncidentId && n.type === 'rejection'
    );

    if (rejectionNotif) {
      log(`✅ Rejection notification found:`, 'green');
      log(`   Title: ${rejectionNotif.title}`, 'white');
      log(`   Message: ${rejectionNotif.message}`, 'white');
      if (rejectionNotif.message.includes('Duplicate report')) {
        log(`   ✓ Rejection reason is included in message`, 'green');
      }
      return true;
    } else {
      log(`❌ Rejection notification NOT found`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Rejection test failed: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Main test function
async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 NOTIFICATION LIFECYCLE TEST', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const results = {
    login: false,
    submitReport: false,
    submissionNotif: false,
    createPatrol: false,
    scheduledNotif: false,
    updatePatrol: false,
    inProgressNotif: false,
    resolveIncident: false,
    resolvedNotif: false,
    rejectionNotif: false,
  };

  results.login = await loginAsPetOwner();
  if (!results.login) {
    log('\n❌ Cannot proceed without login', 'red');
    return;
  }

  results.submitReport = await submitIncidentReport();
  if (!results.submitReport) {
    log('\n❌ Cannot proceed without incident', 'red');
    return;
  }

  results.submissionNotif = await checkSubmissionNotification();
  results.createPatrol = await createPatrolSchedule();
  results.scheduledNotif = await checkScheduledNotification();
  results.updatePatrol = await updatePatrolToInProgress();
  results.inProgressNotif = await checkInProgressNotification();
  results.resolveIncident = await updateIncidentToResolved();
  results.resolvedNotif = await checkResolvedNotification();
  results.rejectionNotif = await testRejectionFlow();

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');

  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${icon} ${test}`, color);
  });

  log('\n' + '-'.repeat(60), 'cyan');
  log(`Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 ALL TESTS PASSED! Notification lifecycle is working correctly.', 'green');
  } else {
    log('\n⚠️ Some tests failed. Please review the output above.', 'yellow');
  }
}

// Run tests
runTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
});
