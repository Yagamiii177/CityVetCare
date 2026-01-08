/**
 * Comprehensive Notification System Test
 * Tests incident-driven notifications for authenticated pet owners
 * 
 * Requirements tested:
 * 1. Notification on incident submission (authenticated users only)
 * 2. Notification on status changes (Verified, In Progress, Resolved, Rejected)
 * 3. Notifications persist in database
 * 4. Notifications visible via API
 * 5. Rejection reasons are included in notifications
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials
const TEST_OWNER = {
  email: 'testowner@example.com',
  password: 'testpass123'
};

// Test utilities
let authToken = null;
let testOwnerId = null;
let testIncidentId = null;

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error(`❌ API call failed: ${endpoint}`, error.message);
    throw error;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testLogin() {
  console.log('\n📋 TEST 1: Login as Pet Owner');
  console.log('─────────────────────────────────────');
  
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: TEST_OWNER.email,
      password: TEST_OWNER.password,
      userType: 'pet_owner'
    })
  });

  if (response.ok && response.data.token) {
    authToken = response.data.token;
    testOwnerId = response.data.userId;
    console.log('✅ Login successful');
    console.log(`   Owner ID: ${testOwnerId}`);
    return true;
  } else {
    console.log('❌ Login failed:', response.data);
    return false;
  }
}

async function testIncidentSubmission() {
  console.log('\n📋 TEST 2: Submit Incident (Authenticated)');
  console.log('─────────────────────────────────────');
  
  const incidentData = {
    reporter_name: 'Test Owner',
    reporter_contact: '1234567890',
    incident_type: 'stray',
    animal_type: 'dog',
    pet_color: 'brown',
    pet_breed: 'mixed',
    pet_gender: 'male',
    pet_size: 'medium',
    description: 'Test incident for notification system',
    latitude: 14.5995,
    longitude: 120.9842,
    location: 'Test Location, Manila',
    incident_date: new Date().toISOString(),
    images: []
  };

  const response = await apiCall('/incidents', {
    method: 'POST',
    body: JSON.stringify(incidentData)
  });

  if (response.ok && response.data.id) {
    testIncidentId = response.data.id;
    console.log('✅ Incident submitted successfully');
    console.log(`   Incident ID: ${testIncidentId}`);
    
    // Wait a moment for notification to be created
    await delay(1000);
    return true;
  } else {
    console.log('❌ Incident submission failed:', response.data);
    return false;
  }
}

async function testNotificationCreatedOnSubmission() {
  console.log('\n📋 TEST 3: Check Notification Created on Submission');
  console.log('─────────────────────────────────────');
  
  const response = await apiCall('/notifications');

  if (response.ok && response.data.notifications) {
    const notifications = response.data.notifications;
    const submissionNotif = notifications.find(n => 
      n.incident_id === testIncidentId && 
      n.type === 'submission'
    );

    if (submissionNotif) {
      console.log('✅ Submission notification found');
      console.log(`   Title: "${submissionNotif.title}"`);
      console.log(`   Message: "${submissionNotif.message}"`);
      console.log(`   Incident ID: ${submissionNotif.incident_id}`);
      console.log(`   Type: ${submissionNotif.type}`);
      console.log(`   Read: ${submissionNotif.is_read ? 'Yes' : 'No'}`);
      return true;
    } else {
      console.log('❌ Submission notification not found');
      console.log(`   Total notifications: ${notifications.length}`);
      return false;
    }
  } else {
    console.log('❌ Failed to fetch notifications:', response.data);
    return false;
  }
}

async function testStatusChangeToVerified() {
  console.log('\n📋 TEST 4: Update Status to Verified');
  console.log('─────────────────────────────────────');
  
  const response = await apiCall(`/incidents/${testIncidentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'Verified'
    })
  });

  if (response.ok) {
    console.log('✅ Status updated to Verified');
    await delay(1000);
    
    // Check notification
    const notifResponse = await apiCall('/notifications');
    const notifications = notifResponse.data.notifications;
    const verifiedNotif = notifications.find(n => 
      n.incident_id === testIncidentId && 
      n.type === 'status_update' &&
      n.title.includes('Verified')
    );

    if (verifiedNotif) {
      console.log('✅ Verified notification found');
      console.log(`   Title: "${verifiedNotif.title}"`);
      console.log(`   Message: "${verifiedNotif.message}"`);
      return true;
    } else {
      console.log('❌ Verified notification not found');
      return false;
    }
  } else {
    console.log('❌ Status update failed:', response.data);
    return false;
  }
}

async function testStatusChangeToInProgress() {
  console.log('\n📋 TEST 5: Update Status to In Progress');
  console.log('─────────────────────────────────────');
  
  const response = await apiCall(`/incidents/${testIncidentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'In Progress'
    })
  });

  if (response.ok) {
    console.log('✅ Status updated to In Progress');
    await delay(1000);
    
    // Check notification
    const notifResponse = await apiCall('/notifications');
    const notifications = notifResponse.data.notifications;
    const inProgressNotif = notifications.find(n => 
      n.incident_id === testIncidentId && 
      n.type === 'status_update' &&
      n.title.includes('Patrol')
    );

    if (inProgressNotif) {
      console.log('✅ In Progress notification found');
      console.log(`   Title: "${inProgressNotif.title}"`);
      console.log(`   Message: "${inProgressNotif.message}"`);
      return true;
    } else {
      console.log('❌ In Progress notification not found');
      return false;
    }
  } else {
    console.log('❌ Status update failed:', response.data);
    return false;
  }
}

async function testStatusChangeToResolved() {
  console.log('\n📋 TEST 6: Update Status to Resolved');
  console.log('─────────────────────────────────────');
  
  const response = await apiCall(`/incidents/${testIncidentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'Resolved'
    })
  });

  if (response.ok) {
    console.log('✅ Status updated to Resolved');
    await delay(1000);
    
    // Check notification
    const notifResponse = await apiCall('/notifications');
    const notifications = notifResponse.data.notifications;
    const resolvedNotif = notifications.find(n => 
      n.incident_id === testIncidentId && 
      n.type === 'status_update' &&
      n.title.includes('Resolved')
    );

    if (resolvedNotif) {
      console.log('✅ Resolved notification found');
      console.log(`   Title: "${resolvedNotif.title}"`);
      console.log(`   Message: "${resolvedNotif.message}"`);
      return true;
    } else {
      console.log('❌ Resolved notification not found');
      return false;
    }
  } else {
    console.log('❌ Status update failed:', response.data);
    return false;
  }
}

async function testRejectionWithReason() {
  console.log('\n📋 TEST 7: Test Rejection with Reason');
  console.log('─────────────────────────────────────');
  
  // Create a new incident to test rejection
  const incidentData = {
    reporter_name: 'Test Owner',
    reporter_contact: '1234567890',
    incident_type: 'stray',
    animal_type: 'dog',
    description: 'Test incident for rejection',
    latitude: 14.5995,
    longitude: 120.9842,
    location: 'Test Location',
    incident_date: new Date().toISOString()
  };

  const createResponse = await apiCall('/incidents', {
    method: 'POST',
    body: JSON.stringify(incidentData)
  });

  if (!createResponse.ok) {
    console.log('❌ Failed to create test incident');
    return false;
  }

  const rejectionIncidentId = createResponse.data.id;
  await delay(500);

  // Now reject it with a reason
  const rejectionReason = 'Duplicate report - already handled under case #12345';
  const response = await apiCall(`/incidents/${rejectionIncidentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'Rejected',
      rejection_reason: rejectionReason
    })
  });

  if (response.ok) {
    console.log('✅ Status updated to Rejected with reason');
    await delay(1000);
    
    // Check notification
    const notifResponse = await apiCall('/notifications');
    const notifications = notifResponse.data.notifications;
    const rejectedNotif = notifications.find(n => 
      n.incident_id === rejectionIncidentId && 
      n.type === 'rejection'
    );

    if (rejectedNotif) {
      console.log('✅ Rejection notification found');
      console.log(`   Title: "${rejectedNotif.title}"`);
      console.log(`   Message: "${rejectedNotif.message}"`);
      
      // Check if rejection reason is in the message
      if (rejectedNotif.message.includes(rejectionReason)) {
        console.log('✅ Rejection reason included in message');
        return true;
      } else {
        console.log('⚠️  Rejection reason not found in message');
        console.log(`   Expected: "${rejectionReason}"`);
        return false;
      }
    } else {
      console.log('❌ Rejection notification not found');
      return false;
    }
  } else {
    console.log('❌ Status update failed:', response.data);
    return false;
  }
}

async function testNotificationPersistence() {
  console.log('\n📋 TEST 8: Test Notification Persistence');
  console.log('─────────────────────────────────────');
  
  // Fetch notifications multiple times to verify persistence
  const response1 = await apiCall('/notifications');
  await delay(500);
  const response2 = await apiCall('/notifications');

  if (response1.ok && response2.ok) {
    const count1 = response1.data.notifications.length;
    const count2 = response2.data.notifications.length;

    if (count1 === count2 && count1 > 0) {
      console.log('✅ Notifications persist correctly');
      console.log(`   Total notifications: ${count1}`);
      return true;
    } else {
      console.log('❌ Notification count mismatch');
      console.log(`   First fetch: ${count1}, Second fetch: ${count2}`);
      return false;
    }
  } else {
    console.log('❌ Failed to fetch notifications');
    return false;
  }
}

async function testUnreadCount() {
  console.log('\n📋 TEST 9: Test Unread Count');
  console.log('─────────────────────────────────────');
  
  const response = await apiCall('/notifications/unread-count');

  if (response.ok && typeof response.data.unread === 'number') {
    console.log('✅ Unread count retrieved');
    console.log(`   Unread notifications: ${response.data.unread}`);
    return true;
  } else {
    console.log('❌ Failed to get unread count:', response.data);
    return false;
  }
}

async function testMarkAsRead() {
  console.log('\n📋 TEST 10: Test Mark as Read');
  console.log('─────────────────────────────────────');
  
  // Get first notification
  const listResponse = await apiCall('/notifications');
  if (!listResponse.ok || listResponse.data.notifications.length === 0) {
    console.log('⚠️  No notifications to mark as read');
    return true;
  }

  const firstNotif = listResponse.data.notifications[0];
  
  // Mark it as read
  const markResponse = await apiCall(`/notifications/${firstNotif.id}/read`, {
    method: 'PUT'
  });

  if (markResponse.ok) {
    console.log('✅ Notification marked as read');
    console.log(`   Notification ID: ${firstNotif.id}`);
    
    // Verify it's marked as read
    await delay(500);
    const verifyResponse = await apiCall('/notifications');
    const updatedNotif = verifyResponse.data.notifications.find(n => n.id === firstNotif.id);
    
    if (updatedNotif && updatedNotif.is_read) {
      console.log('✅ Read status verified');
      return true;
    } else {
      console.log('❌ Read status not updated');
      return false;
    }
  } else {
    console.log('❌ Failed to mark as read:', markResponse.data);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  INCIDENT NOTIFICATION SYSTEM - TEST SUITE    ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`\n🕒 Started at: ${new Date().toLocaleString()}`);
  
  const results = [];

  try {
    // Run all tests
    results.push({ name: 'Login', passed: await testLogin() });
    
    if (!authToken) {
      console.log('\n❌ Cannot continue without authentication');
      return;
    }

    results.push({ name: 'Incident Submission', passed: await testIncidentSubmission() });
    results.push({ name: 'Submission Notification', passed: await testNotificationCreatedOnSubmission() });
    results.push({ name: 'Status Change: Verified', passed: await testStatusChangeToVerified() });
    results.push({ name: 'Status Change: In Progress', passed: await testStatusChangeToInProgress() });
    results.push({ name: 'Status Change: Resolved', passed: await testStatusChangeToResolved() });
    results.push({ name: 'Rejection with Reason', passed: await testRejectionWithReason() });
    results.push({ name: 'Notification Persistence', passed: await testNotificationPersistence() });
    results.push({ name: 'Unread Count', passed: await testUnreadCount() });
    results.push({ name: 'Mark as Read', passed: await testMarkAsRead() });

  } catch (error) {
    console.error('\n❌ Test execution error:', error);
  }

  // Print summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY                      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });

  console.log('\n─────────────────────────────────────');
  console.log(`Total: ${passed}/${total} tests passed`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
  console.log('─────────────────────────────────────\n');

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Notification system is working correctly.\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the failures above.\n');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
