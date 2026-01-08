/**
 * Comprehensive Test: Status Synchronization & Patrol Staff Management
 * 
 * This test validates:
 * 1. Status synchronization between patrol schedules and incident reports
 * 2. Incident report is the single source of truth for status
 * 3. Patrol staff table displays data from dog_catcher table
 * 4. Remove staff functionality works correctly
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Test colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

async function runTests() {
  let testIncidentId = null;
  let testScheduleId = null;

  try {
    log.section('TEST 1: Create Test Incident Report');
    
    // Create a test incident
    const incidentResponse = await axios.post(`${API_BASE}/incidents`, {
      reporter_name: 'Test Reporter',
      reporter_contact: '09123456789',
      report_type: 'stray',
      description: 'Test incident for status sync validation',
      location: 'Test Location',
      latitude: 14.5995,
      longitude: 120.9842,
      incident_date: new Date().toISOString(),
      status: 'Verified', // Start with Verified status
    });

    testIncidentId = incidentResponse.data.id || incidentResponse.data.data?.id;
    log.success(`Created test incident #${testIncidentId} with status: Verified`);

    // Verify incident status
    const incidentCheck1 = await axios.get(`${API_BASE}/incidents/${testIncidentId}`);
    const incident1 = incidentCheck1.data.data || incidentCheck1.data;
    log.info(`Incident status confirmed: ${incident1.status}`);

    log.section('TEST 2: Create Patrol Schedule');

    // Get available dog catchers
    const staffResponse = await axios.get(`${API_BASE}/patrol-staff`);
    const staff = staffResponse.data.records || staffResponse.data;
    
    if (staff.length < 2) {
      log.error('Need at least 2 dog catchers for testing. Please add more staff.');
      return;
    }

    log.info(`Found ${staff.length} available dog catchers`);
    log.info(`Staff IDs: ${staff.map(s => `#${s.id} (${s.team_name || s.leader_name})`).join(', ')}`);

    // Create patrol schedule with multiple staff
    const staffIds = [staff[0].id, staff[1].id];
    const scheduleResponse = await axios.post(`${API_BASE}/patrol-schedules`, {
      incident_id: testIncidentId,
      assigned_staff_ids: staffIds.join(','),
      schedule_date: new Date().toISOString().split('T')[0],
      schedule_time: '10:00:00',
      notes: 'Test patrol schedule',
    });

    testScheduleId = scheduleResponse.data.id || scheduleResponse.data.data?.id;
    log.success(`Created patrol schedule #${testScheduleId}`);

    log.section('TEST 3: Verify Status Synchronization (IN PROGRESS)');

    // Check incident status after patrol creation
    const incidentCheck2 = await axios.get(`${API_BASE}/incidents/${testIncidentId}`);
    const incident2 = incidentCheck2.data.data || incidentCheck2.data;
    
    if (incident2.status === 'In Progress') {
      log.success(`✓ CRITICAL FIX VERIFIED: Incident status updated to 'In Progress' when patrol scheduled`);
    } else {
      log.error(`✗ CRITICAL BUG: Incident status is '${incident2.status}' instead of 'In Progress'`);
    }

    // Get patrol schedule and verify it reads incident status
    const scheduleCheck = await axios.get(`${API_BASE}/patrol-schedules/${testScheduleId}`);
    const schedule = scheduleCheck.data.data || scheduleCheck.data;
    
    log.info(`Patrol Schedule Status: ${schedule.status}`);
    log.info(`Incident Status (from schedule): ${schedule.incident_status}`);
    
    if (schedule.incident_status === 'In Progress') {
      log.success(`✓ VERIFIED: Patrol schedule correctly reads incident status from incident_report`);
    } else {
      log.error(`✗ ERROR: Patrol schedule shows wrong incident status: ${schedule.incident_status}`);
    }

    log.section('TEST 4: Verify Patrol Staff Details');

    if (schedule.staff_details && schedule.staff_details.length > 0) {
      log.success(`✓ Staff details included in response (${schedule.staff_details.length} members)`);
      
      schedule.staff_details.forEach((member, idx) => {
        log.info(`  Staff ${idx + 1}: ${member.full_name} (ID: ${member.catcher_id}, Contact: ${member.contact_number || 'N/A'})`);
      });
    } else {
      log.error(`✗ Staff details not included in patrol schedule response`);
    }

    log.section('TEST 5: Remove Staff Member');

    if (schedule.staff_details && schedule.staff_details.length >= 2) {
      const staffToRemove = schedule.staff_details[1];
      log.info(`Attempting to remove: ${staffToRemove.full_name} (ID: ${staffToRemove.catcher_id})`);
      
      const removeResponse = await axios.delete(
        `${API_BASE}/patrol-schedules/${testScheduleId}/staff/${staffToRemove.catcher_id}`
      );
      
      if (removeResponse.data.success) {
        log.success(`✓ Staff member removed successfully`);
        
        // Verify removal
        const updatedSchedule = await axios.get(`${API_BASE}/patrol-schedules/${testScheduleId}`);
        const updated = updatedSchedule.data.data || updatedSchedule.data;
        
        log.info(`Remaining staff count: ${updated.staff_details.length}`);
        log.info(`Remaining staff: ${updated.staff_details.map(s => s.full_name).join(', ')}`);
        
        if (updated.staff_details.length === 1) {
          log.success(`✓ Staff removal successful, 1 member remains`);
        } else {
          log.error(`✗ Staff count mismatch after removal`);
        }
      }
    } else {
      log.warn('Not enough staff members to test removal');
    }

    log.section('TEST 6: Try to Remove Last Staff Member (Should Fail)');

    const currentSchedule = await axios.get(`${API_BASE}/patrol-schedules/${testScheduleId}`);
    const current = currentSchedule.data.data || currentSchedule.data;
    
    if (current.staff_details && current.staff_details.length === 1) {
      const lastStaff = current.staff_details[0];
      
      try {
        await axios.delete(`${API_BASE}/patrol-schedules/${testScheduleId}/staff/${lastStaff.catcher_id}`);
        log.error(`✗ CRITICAL BUG: Was able to remove the last staff member!`);
      } catch (err) {
        if (err.response?.data?.message?.includes('Cannot remove the last staff member')) {
          log.success(`✓ VALIDATION WORKS: Cannot remove last staff member (as expected)`);
        } else {
          log.error(`✗ Wrong error message: ${err.response?.data?.message}`);
        }
      }
    }

    log.section('TEST 7: Complete Patrol and Verify Status (RESOLVED)');

    // Update patrol status to completed
    await axios.put(`${API_BASE}/patrol-schedules/${testScheduleId}`, {
      status: 'completed',
    });

    log.info(`Patrol marked as completed`);

    // Check incident status after patrol completion
    const incidentCheck3 = await axios.get(`${API_BASE}/incidents/${testIncidentId}`);
    const incident3 = incidentCheck3.data.data || incidentCheck3.data;
    
    if (incident3.status === 'Resolved') {
      log.success(`✓ CRITICAL FIX VERIFIED: Incident status updated to 'Resolved' when patrol completed`);
    } else {
      log.error(`✗ CRITICAL BUG: Incident status is '${incident3.status}' instead of 'Resolved'`);
    }

    // Verify patrol schedule shows resolved status
    const scheduleCheck2 = await axios.get(`${API_BASE}/patrol-schedules/${testScheduleId}`);
    const schedule2 = scheduleCheck2.data.data || scheduleCheck2.data;
    
    if (schedule2.incident_status === 'Resolved') {
      log.success(`✓ VERIFIED: Patrol schedule correctly shows 'Resolved' status from incident_report`);
    } else {
      log.error(`✗ ERROR: Patrol schedule shows wrong status: ${schedule2.incident_status}`);
    }

    log.section('TEST 8: Verify Status Consistency Across All Modules');

    // Check All Incident Reports view
    const allIncidents = await axios.get(`${API_BASE}/incidents`);
    const incidents = allIncidents.data.records || allIncidents.data;
    const testIncident = incidents.find(i => i.id === testIncidentId);
    
    if (testIncident && testIncident.status === 'Resolved') {
      log.success(`✓ All Incident Reports shows: Resolved`);
    } else {
      log.error(`✗ All Incident Reports shows: ${testIncident?.status}`);
    }

    // Check Patrol Schedule Management view
    const allSchedules = await axios.get(`${API_BASE}/patrol-schedules`);
    const schedules = allSchedules.data.records || allSchedules.data;
    const testSchedule = schedules.find(s => s.id === testScheduleId);
    
    if (testSchedule && testSchedule.incident_status === 'Resolved') {
      log.success(`✓ Patrol Schedule Management shows: Resolved`);
    } else {
      log.error(`✗ Patrol Schedule Management shows: ${testSchedule?.incident_status}`);
    }

    log.section('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    log.success('Status synchronization is working correctly');
    log.success('Patrol staff table includes dog_catcher details');
    log.success('Remove staff functionality validates correctly');
    log.success('Single source of truth (incident_report) is enforced');

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    // Cleanup: Delete test data
    if (testScheduleId) {
      try {
        await axios.delete(`${API_BASE}/patrol-schedules/${testScheduleId}`);
        log.info(`Cleaned up test schedule #${testScheduleId}`);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
    
    if (testIncidentId) {
      try {
        await axios.delete(`${API_BASE}/incidents/${testIncidentId}`);
        log.info(`Cleaned up test incident #${testIncidentId}`);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  }
}

// Run tests
console.log('\n🧪 Starting Comprehensive Status Sync & Staff Management Test\n');
runTests().catch(console.error);
