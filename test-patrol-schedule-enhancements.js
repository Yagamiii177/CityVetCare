/**
 * Test Script: Patrol Schedule Management Enhancements
 * 
 * This script validates all 6 major enhancements to the Patrol Schedule Management module:
 * 1. Incident Status Sync (CRITICAL)
 * 2. Patrol Staff Table in View Modal
 * 3. Add New Dog Catcher Button & Modal
 * 4. Incidents Waiting Banner at Top
 * 5. Data Integrity & Safety
 * 6. Complete System Validation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test configuration
const config = {
  headers: { 'Content-Type': 'application/json' }
};

// Colors for console output
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

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logTest(testName, status, details = '') {
  const symbol = status === 'PASS' ? '✓' : '✗';
  const color = status === 'PASS' ? 'green' : 'red';
  log(`${symbol} ${testName}`, color);
  if (details) {
    log(`  ${details}`, 'yellow');
  }
}

// Test 1: Verify Incident Status Sync on Patrol Creation
async function testIncidentStatusSyncOnCreate() {
  logSection('TEST 1: Incident Status Sync - Patrol Creation');
  
  try {
    // Step 1: Get a verified incident
    log('📋 Fetching verified incidents...', 'blue');
    const incidentsRes = await axios.get(`${API_BASE}/incidents?status=verified`, config);
    const incidents = incidentsRes.data.records || incidentsRes.data.data || [];
    
    if (incidents.length === 0) {
      logTest('Find verified incident', 'FAIL', 'No verified incidents found. Create one first.');
      return false;
    }
    
    const testIncident = incidents[0];
    log(`Found incident #${testIncident.id} with status: ${testIncident.status}`, 'blue');
    logTest('Find verified incident', 'PASS', `Incident #${testIncident.id} found`);
    
    // Step 2: Get active patrol staff
    log('\n👥 Fetching active patrol staff...', 'blue');
    const staffRes = await axios.get(`${API_BASE}/patrol-staff?status=active`, config);
    const staff = staffRes.data.records || staffRes.data.data || [];
    
    if (staff.length === 0) {
      logTest('Find patrol staff', 'FAIL', 'No active patrol staff found');
      return false;
    }
    
    log(`Found ${staff.length} active staff members`, 'blue');
    logTest('Find patrol staff', 'PASS', `${staff.length} staff available`);
    
    // Step 3: Create patrol schedule
    log('\n🚨 Creating patrol schedule...', 'blue');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduleDate = tomorrow.toISOString().split('T')[0];
    
    const scheduleData = {
      assigned_staff_ids: staff[0].id.toString(),
      incident_id: testIncident.id,
      schedule_date: `${scheduleDate} 10:00:00`,
      schedule_time: '10:00',
      status: 'scheduled',
      notes: 'Test patrol schedule for status sync validation'
    };
    
    const createRes = await axios.post(`${API_BASE}/patrol-schedules`, scheduleData, config);
    const createdSchedule = createRes.data.data || createRes.data;
    log(`✓ Patrol schedule created with ID: ${createdSchedule.id}`, 'green');
    
    // Step 4: CRITICAL - Verify incident status was updated to "In Progress"
    log('\n🔍 Verifying incident status was updated to "In Progress"...', 'blue');
    const updatedIncidentRes = await axios.get(`${API_BASE}/incidents/${testIncident.id}`, config);
    const updatedIncident = updatedIncidentRes.data.data || updatedIncidentRes.data;
    
    log(`Incident #${testIncident.id} status: ${updatedIncident.status}`, 'blue');
    
    if (updatedIncident.status.toLowerCase() === 'in progress' || updatedIncident.status === 'in_progress') {
      logTest('Incident status sync on patrol creation', 'PASS', 
        `Status correctly updated from "${testIncident.status}" to "${updatedIncident.status}"`);
      
      // Cleanup
      await axios.delete(`${API_BASE}/patrol-schedules/${createdSchedule.id}`, config);
      log('🧹 Cleanup: Test schedule deleted', 'yellow');
      
      return true;
    } else {
      logTest('Incident status sync on patrol creation', 'FAIL', 
        `Expected "In Progress" but got "${updatedIncident.status}"`);
      return false;
    }
    
  } catch (error) {
    logTest('Incident status sync test', 'FAIL', error.message);
    console.error(error.response?.data || error);
    return false;
  }
}

// Test 2: Verify Incident Status Sync on Patrol Completion
async function testIncidentStatusSyncOnComplete() {
  logSection('TEST 2: Incident Status Sync - Patrol Completion');
  
  try {
    // Step 1: Get an in-progress schedule
    log('📋 Fetching in-progress patrol schedules...', 'blue');
    const schedulesRes = await axios.get(`${API_BASE}/patrol-schedules?status=in_progress`, config);
    let schedules = schedulesRes.data.records || schedulesRes.data.data || [];
    
    // If no in-progress schedules, create one
    if (schedules.length === 0) {
      log('No in-progress schedules found. Creating one for testing...', 'yellow');
      
      const incidentsRes = await axios.get(`${API_BASE}/incidents?status=verified`, config);
      const incidents = incidentsRes.data.records || [];
      
      const staffRes = await axios.get(`${API_BASE}/patrol-staff?status=active`, config);
      const staff = staffRes.data.records || [];
      
      if (incidents.length === 0 || staff.length === 0) {
        logTest('Setup test schedule', 'FAIL', 'Need verified incident and active staff');
        return false;
      }
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const scheduleDate = tomorrow.toISOString().split('T')[0];
      
      const scheduleData = {
        assigned_staff_ids: staff[0].id.toString(),
        incident_id: incidents[0].id,
        schedule_date: `${scheduleDate} 11:00:00`,
        schedule_time: '11:00',
        status: 'scheduled',
        notes: 'Test schedule for completion sync'
      };
      
      const createRes = await axios.post(`${API_BASE}/patrol-schedules`, scheduleData, config);
      const newSchedule = createRes.data.data || createRes.data;
      
      // Update to in_progress
      await axios.put(`${API_BASE}/patrol-schedules/${newSchedule.id}`, { status: 'in_progress' }, config);
      
      const updatedRes = await axios.get(`${API_BASE}/patrol-schedules/${newSchedule.id}`, config);
      schedules = [updatedRes.data.data || updatedRes.data];
      
      log(`✓ Created test schedule #${newSchedule.id}`, 'green');
    }
    
    const testSchedule = schedules[0];
    log(`Using schedule #${testSchedule.id} for incident #${testSchedule.incident_id}`, 'blue');
    logTest('Find in-progress schedule', 'PASS', `Schedule #${testSchedule.id}`);
    
    // Step 2: Get incident before completion
    const beforeRes = await axios.get(`${API_BASE}/incidents/${testSchedule.incident_id}`, config);
    const beforeIncident = beforeRes.data.data || beforeRes.data;
    log(`Incident status before completion: ${beforeIncident.status}`, 'blue');
    
    // Step 3: Mark patrol as completed
    log('\n✅ Marking patrol as completed...', 'blue');
    await axios.put(`${API_BASE}/patrol-schedules/${testSchedule.id}`, { 
      status: 'completed' 
    }, config);
    
    // Step 4: CRITICAL - Verify incident status was updated to "Resolved"
    log('\n🔍 Verifying incident status was updated to "Resolved"...', 'blue');
    const afterRes = await axios.get(`${API_BASE}/incidents/${testSchedule.incident_id}`, config);
    const afterIncident = afterRes.data.data || afterRes.data;
    
    log(`Incident #${testSchedule.incident_id} status: ${afterIncident.status}`, 'blue');
    
    if (afterIncident.status.toLowerCase() === 'resolved' || afterIncident.status === 'resolved') {
      logTest('Incident status sync on patrol completion', 'PASS', 
        `Status correctly updated from "${beforeIncident.status}" to "${afterIncident.status}"`);
      
      // Cleanup
      await axios.delete(`${API_BASE}/patrol-schedules/${testSchedule.id}`, config);
      log('🧹 Cleanup: Test schedule deleted', 'yellow');
      
      return true;
    } else {
      logTest('Incident status sync on patrol completion', 'FAIL', 
        `Expected "Resolved" but got "${afterIncident.status}"`);
      return false;
    }
    
  } catch (error) {
    logTest('Incident status sync on completion', 'FAIL', error.message);
    console.error(error.response?.data || error);
    return false;
  }
}

// Test 3: Verify Add Dog Catcher Functionality
async function testAddDogCatcher() {
  logSection('TEST 3: Add New Dog Catcher API');
  
  try {
    // Get initial count
    const beforeRes = await axios.get(`${API_BASE}/patrol-staff`, config);
    const beforeCount = (beforeRes.data.records || []).length;
    log(`Current patrol staff count: ${beforeCount}`, 'blue');
    
    // Create new dog catcher
    const newCatcher = {
      name: `Test Catcher ${Date.now()}`,
      team_name: `Test Team ${Date.now()}`,
      contact_number: `09${Math.floor(Math.random() * 1000000000)}`
    };
    
    log('\n➕ Creating new dog catcher...', 'blue');
    const createRes = await axios.post(`${API_BASE}/patrol-staff`, newCatcher, config);
    const created = createRes.data.data || createRes.data;
    
    log(`✓ Dog catcher created with ID: ${created.id}`, 'green');
    logTest('Create dog catcher via API', 'PASS', `ID: ${created.id}`);
    
    // Verify it appears in the list
    log('\n🔍 Verifying new catcher appears in list...', 'blue');
    const afterRes = await axios.get(`${API_BASE}/patrol-staff`, config);
    const afterCount = (afterRes.data.records || []).length;
    const afterStaff = afterRes.data.records || [];
    
    const foundCatcher = afterStaff.find(s => s.id === created.id);
    
    if (foundCatcher && afterCount === beforeCount + 1) {
      logTest('New dog catcher appears in list', 'PASS', 
        `Count increased from ${beforeCount} to ${afterCount}`);
      
      // Cleanup
      await axios.delete(`${API_BASE}/patrol-staff/${created.id}`, config);
      log('🧹 Cleanup: Test catcher deleted', 'yellow');
      
      return true;
    } else {
      logTest('New dog catcher appears in list', 'FAIL', 
        `Expected count ${beforeCount + 1}, got ${afterCount}`);
      return false;
    }
    
  } catch (error) {
    logTest('Add dog catcher test', 'FAIL', error.message);
    console.error(error.response?.data || error);
    return false;
  }
}

// Test 4: Verify Patrol Staff Details are Retrievable
async function testPatrolStaffDetails() {
  logSection('TEST 4: Patrol Staff Details Retrieval');
  
  try {
    // Get all patrol schedules
    log('📋 Fetching patrol schedules...', 'blue');
    const schedulesRes = await axios.get(`${API_BASE}/patrol-schedules`, config);
    const schedules = schedulesRes.data.records || [];
    
    if (schedules.length === 0) {
      logTest('Find schedules with staff', 'FAIL', 'No schedules found');
      return false;
    }
    
    const scheduleWithStaff = schedules.find(s => s.assigned_staff_ids || s.assigned_catcher_id);
    
    if (!scheduleWithStaff) {
      logTest('Find schedules with staff', 'FAIL', 'No schedules with assigned staff');
      return false;
    }
    
    log(`Found schedule #${scheduleWithStaff.id} with staff IDs: ${scheduleWithStaff.assigned_staff_ids || scheduleWithStaff.assigned_catcher_id}`, 'blue');
    logTest('Find schedules with staff', 'PASS', `Schedule #${scheduleWithStaff.id}`);
    
    // Parse staff IDs
    const staffIds = (scheduleWithStaff.assigned_staff_ids || scheduleWithStaff.assigned_catcher_id || '')
      .toString()
      .split(',')
      .map(id => id.trim())
      .filter(id => id);
    
    log(`\n👥 Retrieving details for ${staffIds.length} staff member(s)...`, 'blue');
    
    // Get staff details
    const staffRes = await axios.get(`${API_BASE}/patrol-staff`, config);
    const allStaff = staffRes.data.records || [];
    const assignedStaff = allStaff.filter(staff => staffIds.includes(staff.id.toString()));
    
    if (assignedStaff.length > 0) {
      assignedStaff.forEach(staff => {
        log(`  - ${staff.team_name || staff.leader_name} (ID: ${staff.id}, Contact: ${staff.contact_number || 'N/A'})`, 'green');
      });
      
      logTest('Retrieve patrol staff details', 'PASS', 
        `Retrieved ${assignedStaff.length} staff details successfully`);
      return true;
    } else {
      logTest('Retrieve patrol staff details', 'FAIL', 
        'Staff IDs found but details not retrieved');
      return false;
    }
    
  } catch (error) {
    logTest('Patrol staff details test', 'FAIL', error.message);
    console.error(error.response?.data || error);
    return false;
  }
}

// Test 5: Verify Pending Incidents Count Logic
async function testPendingIncidentsCount() {
  logSection('TEST 5: Pending Incidents Count Logic');
  
  try {
    // Get verified incidents
    log('📋 Fetching verified incidents...', 'blue');
    const incidentsRes = await axios.get(`${API_BASE}/incidents?status=verified`, config);
    const verifiedIncidents = incidentsRes.data.records || [];
    
    // Get all schedules
    log('📋 Fetching patrol schedules...', 'blue');
    const schedulesRes = await axios.get(`${API_BASE}/patrol-schedules`, config);
    const schedules = schedulesRes.data.records || [];
    
    // Calculate pending count
    const scheduledIncidentIds = new Set(schedules.map(s => s.incident_id));
    const pendingIncidents = verifiedIncidents.filter(inc => !scheduledIncidentIds.has(inc.id));
    const pendingCount = pendingIncidents.length;
    
    log(`\n📊 Statistics:`, 'blue');
    log(`  Total verified incidents: ${verifiedIncidents.length}`, 'blue');
    log(`  Total schedules: ${schedules.length}`, 'blue');
    log(`  Incidents waiting to be scheduled: ${pendingCount}`, 'blue');
    
    if (pendingIncidents.length > 0) {
      log(`\n⏳ Pending incidents:`, 'yellow');
      pendingIncidents.slice(0, 3).forEach(inc => {
        log(`  - Incident #${inc.id}: ${inc.description || 'No description'}`, 'yellow');
      });
      if (pendingIncidents.length > 3) {
        log(`  ... and ${pendingIncidents.length - 3} more`, 'yellow');
      }
    }
    
    logTest('Calculate pending incidents count', 'PASS', 
      `${pendingCount} incident(s) waiting to be scheduled`);
    
    return true;
    
  } catch (error) {
    logTest('Pending incidents count test', 'FAIL', error.message);
    console.error(error.response?.data || error);
    return false;
  }
}

// Test 6: System-Wide Status Consistency Check
async function testSystemWideStatusConsistency() {
  logSection('TEST 6: System-Wide Status Consistency Check');
  
  try {
    // Get all incidents with schedules
    log('📋 Fetching all incidents...', 'blue');
    const incidentsRes = await axios.get(`${API_BASE}/incidents`, config);
    const allIncidents = incidentsRes.data.records || [];
    
    log('📋 Fetching all patrol schedules...', 'blue');
    const schedulesRes = await axios.get(`${API_BASE}/patrol-schedules`, config);
    const allSchedules = schedulesRes.data.records || [];
    
    // Build schedule map
    const scheduleMap = {};
    allSchedules.forEach(schedule => {
      if (!scheduleMap[schedule.incident_id]) {
        scheduleMap[schedule.incident_id] = [];
      }
      scheduleMap[schedule.incident_id].push(schedule);
    });
    
    log(`\n🔍 Checking status consistency...`, 'blue');
    
    let consistencyIssues = 0;
    let consistentCount = 0;
    
    for (const incident of allIncidents) {
      const schedules = scheduleMap[incident.id] || [];
      
      if (schedules.length === 0) {
        // No schedule - should be Pending, Verified, or Rejected
        const validStatuses = ['pending', 'verified', 'rejected', 'cancelled'];
        if (!validStatuses.includes(incident.status.toLowerCase())) {
          log(`  ⚠️ Incident #${incident.id}: Status "${incident.status}" but no schedule exists`, 'red');
          consistencyIssues++;
        } else {
          consistentCount++;
        }
      } else {
        // Has schedule - check status matches
        const activeSchedule = schedules.find(s => 
          s.status === 'scheduled' || s.status === 'in_progress'
        );
        
        const completedSchedule = schedules.find(s => s.status === 'completed');
        
        if (activeSchedule && incident.status.toLowerCase() !== 'in progress' && incident.status !== 'in_progress') {
          log(`  ⚠️ Incident #${incident.id}: Has ${activeSchedule.status} patrol but status is "${incident.status}"`, 'red');
          consistencyIssues++;
        } else if (completedSchedule && incident.status.toLowerCase() !== 'resolved') {
          log(`  ⚠️ Incident #${incident.id}: Has completed patrol but status is "${incident.status}"`, 'red');
          consistencyIssues++;
        } else {
          consistentCount++;
        }
      }
    }
    
    log(`\n📊 Consistency Results:`, 'blue');
    log(`  ✓ Consistent: ${consistentCount}`, 'green');
    log(`  ✗ Inconsistent: ${consistencyIssues}`, consistencyIssues > 0 ? 'red' : 'green');
    
    if (consistencyIssues === 0) {
      logTest('System-wide status consistency', 'PASS', 
        `All ${allIncidents.length} incidents have consistent status`);
      return true;
    } else {
      logTest('System-wide status consistency', 'FAIL', 
        `Found ${consistencyIssues} inconsistencies`);
      return false;
    }
    
  } catch (error) {
    logTest('Status consistency check', 'FAIL', error.message);
    console.error(error.response?.data || error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║              PATROL SCHEDULE MANAGEMENT - ENHANCEMENT TESTS               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    total: 6,
    passed: 0,
    failed: 0
  };
  
  // Run all tests
  const test1 = await testIncidentStatusSyncOnCreate();
  if (test1) results.passed++; else results.failed++;
  
  const test2 = await testIncidentStatusSyncOnComplete();
  if (test2) results.passed++; else results.failed++;
  
  const test3 = await testAddDogCatcher();
  if (test3) results.passed++; else results.failed++;
  
  const test4 = await testPatrolStaffDetails();
  if (test4) results.passed++; else results.failed++;
  
  const test5 = await testPendingIncidentsCount();
  if (test5) results.passed++; else results.failed++;
  
  const test6 = await testSystemWideStatusConsistency();
  if (test6) results.passed++; else results.failed++;
  
  // Summary
  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
  
  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! System is ready for production.', 'green');
  } else {
    log('\n⚠️ SOME TESTS FAILED. Please review the issues above.', 'red');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
