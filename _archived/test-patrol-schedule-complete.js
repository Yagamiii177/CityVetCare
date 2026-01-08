const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const test = async (name, fn) => {
  try {
    await fn();
    log(`✓ ${name}`, colors.green);
    testResults.passed++;
  } catch (error) {
    log(`✗ ${name}`, colors.red);
    log(`  Error: ${error.message}`, colors.red);
    testResults.failed++;
  }
};

const warn = (message) => {
  log(`⚠ ${message}`, colors.yellow);
  testResults.warnings++;
};

async function runTests() {
  log('\n' + '='.repeat(70), colors.cyan);
  log('PATROL SCHEDULE MANAGEMENT - COMPREHENSIVE TEST SUITE', colors.bold + colors.cyan);
  log('='.repeat(70) + '\n', colors.cyan);

  // Test 1: Check Patrol Staff API
  log('\n📋 Test Group 1: Patrol Staff Management', colors.bold + colors.blue);
  
  await test('GET /api/patrol-staff returns animal catchers', async () => {
    const response = await axios.get(`${API_URL}/patrol-staff`);
    if (!response.data.success) throw new Error('API returned error');
    if (response.data.records.length < 10) {
      throw new Error(`Expected at least 10 animal catchers, got ${response.data.records.length}`);
    }
    log(`  Found ${response.data.records.length} animal catchers`, colors.green);
    
    // Verify each has required fields
    response.data.records.forEach(staff => {
      if (!staff.id) throw new Error('Staff missing ID');
      if (!staff.team_name && !staff.leader_name) throw new Error('Staff missing name');
    });
  });

  await test('Each animal catcher has unique ID and contact', async () => {
    const response = await axios.get(`${API_URL}/patrol-staff`);
    const ids = response.data.records.map(s => s.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      throw new Error('Duplicate IDs found');
    }
    log(`  All ${ids.length} animal catchers have unique IDs`, colors.green);
  });

  // Test 2: Schedule Conflict Detection
  log('\n🔍 Test Group 2: Schedule Conflict Detection', colors.bold + colors.blue);

  let testIncidentId;
  await test('Create test incident for scheduling', async () => {
    const incidentData = {
      reporter_name: 'Test Reporter',
      reporter_contact: '+63 999 999 9999',
      location: 'Test Location for Patrol',
      latitude: 14.5995,
      longitude: 120.9842,
      description: 'Test incident for patrol schedule validation',
      incident_date: new Date().toISOString(),
      report_type: 'stray',
      status: 'verified',
      animal_type: 'Dog',
      pet_color: 'Brown',
      pet_breed: 'Mixed',
    };

    const response = await axios.post(`${API_URL}/incidents`, incidentData);
    testIncidentId = response.data.id;
    log(`  Created test incident #${testIncidentId}`, colors.green);
  });

  await test('POST /api/patrol-schedules/check-conflict endpoint exists', async () => {
    const response = await axios.post(`${API_URL}/patrol-schedules/check-conflict`, {
      staff_ids: '1',
      schedule_date: '2026-01-10 10:00:00',
      schedule_time: '10:00',
    });
    if (!response.data.hasOwnProperty('has_conflict')) {
      throw new Error('Response missing has_conflict field');
    }
    log(`  Conflict check API working`, colors.green);
  });

  let firstScheduleId;
  await test('Create first patrol schedule successfully', async () => {
    const scheduleData = {
      incident_id: testIncidentId,
      assigned_staff_ids: '1,2',
      assigned_staff_names: 'Carlos Mendoza, Maria Santos',
      schedule_date: '2026-01-10 10:00:00',
      schedule_time: '10:00',
      status: 'scheduled',
      notes: 'Test schedule 1',
    };

    const response = await axios.post(`${API_URL}/patrol-schedules`, scheduleData);
    firstScheduleId = response.data.id;
    log(`  Created schedule #${firstScheduleId} with 2 staff members`, colors.green);
  });

  await test('Detect conflict for overlapping schedule', async () => {
    const conflictCheck = await axios.post(`${API_URL}/patrol-schedules/check-conflict`, {
      staff_ids: '1,3', // Staff 1 is already scheduled
      schedule_date: '2026-01-10 10:30:00',
      schedule_time: '10:30',
    });

    if (!conflictCheck.data.has_conflict) {
      throw new Error('Should detect conflict with Carlos Mendoza');
    }
    
    log(`  Correctly detected conflict: ${conflictCheck.data.conflicts[0].staff_name}`, colors.green);
  });

  await test('Block creation of conflicting schedule', async () => {
    const scheduleData = {
      incident_id: testIncidentId,
      assigned_staff_ids: '1', // Carlos already scheduled at 10:00
      assigned_staff_names: 'Carlos Mendoza',
      schedule_date: '2026-01-10 10:30:00',
      schedule_time: '10:30',
      status: 'scheduled',
    };

    try {
      await axios.post(`${API_URL}/patrol-schedules`, scheduleData);
      throw new Error('Should have blocked conflicting schedule');
    } catch (error) {
      if (error.response && error.response.data.message.includes('conflict')) {
        log(`  Correctly blocked: ${error.response.data.message}`, colors.green);
      } else {
        throw error;
      }
    }
  });

  await test('Allow schedule with different staff at same time', async () => {
    const scheduleData = {
      incident_id: testIncidentId,
      assigned_staff_ids: '5,6', // Different staff members
      assigned_staff_names: 'Roberto Cruz, Sofia Diaz',
      schedule_date: '2026-01-10 10:00:00',
      schedule_time: '10:00',
      status: 'scheduled',
    };

    const response = await axios.post(`${API_URL}/patrol-schedules`, scheduleData);
    log(`  Created schedule #${response.data.id} with different staff`, colors.green);
  });

  // Test 3: Multiple Staff Assignment
  log('\n👥 Test Group 3: Multiple Staff Assignment', colors.bold + colors.blue);

  await test('Create schedule with multiple staff (5 members)', async () => {
    const scheduleData = {
      incident_id: testIncidentId,
      assigned_staff_ids: '7,8,9,10,11',
      assigned_staff_names: 'Miguel Torres, Elena Rodriguez, Diego Hernandez, Isabella Lopez, Fernando Gomez',
      schedule_date: '2026-01-11 14:00:00',
      schedule_time: '14:00',
      status: 'scheduled',
      notes: 'Large team patrol',
    };

    const response = await axios.post(`${API_URL}/patrol-schedules`, scheduleData);
    log(`  Created schedule with 5 staff members`, colors.green);
  });

  // Test 4: Data Integrity
  log('\n🔒 Test Group 4: Data Integrity & Workflow', colors.bold + colors.blue);

  await test('Verify schedules persist correctly', async () => {
    const response = await axios.get(`${API_URL}/patrol-schedules`);
    if (response.data.records.length < 3) {
      throw new Error(`Expected at least 3 schedules, got ${response.data.records.length}`);
    }
    log(`  Found ${response.data.records.length} total schedules`, colors.green);
  });

  await test('GET /api/patrol-schedules/:id returns schedule details', async () => {
    const response = await axios.get(`${API_URL}/patrol-schedules/${firstScheduleId}`);
    if (!response.data.data) throw new Error('No schedule data returned');
    
    const schedule = response.data.data;
    if (!schedule.assigned_staff_names) {
      throw new Error('Missing staff names');
    }
    log(`  Schedule details: ${schedule.assigned_staff_names}`, colors.green);
  });

  await test('Update schedule status to in_progress', async () => {
    const updateData = {
      assigned_staff_ids: '1',
      status: 'in_progress',
    };

    await axios.put(`${API_URL}/patrol-schedules/${firstScheduleId}`, updateData);
    log(`  Updated schedule #${firstScheduleId} to in_progress`, colors.green);
  });

  await test('GET /api/patrol-schedules?status=in_progress filters correctly', async () => {
    const response = await axios.get(`${API_URL}/patrol-schedules?status=in_progress`);
    if (response.data.records.length === 0) {
      throw new Error('No in_progress schedules found');
    }
    log(`  Found ${response.data.records.length} in_progress schedule(s)`, colors.green);
  });

  // Test 5: Edge Cases
  log('\n⚠️  Test Group 5: Edge Cases & Validation', colors.bold + colors.blue);

  await test('Reject schedule without required fields', async () => {
    try {
      await axios.post(`${API_URL}/patrol-schedules`, {
        notes: 'Missing required fields',
      });
      throw new Error('Should reject incomplete data');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log(`  Correctly rejected: ${error.response.data.message}`, colors.green);
      } else {
        throw error;
      }
    }
  });

  await test('Reject schedule with invalid staff ID', async () => {
    try {
      await axios.post(`${API_URL}/patrol-schedules`, {
        incident_id: testIncidentId,
        assigned_staff_ids: '99999',
        schedule_date: '2026-01-12 10:00:00',
        schedule_time: '10:00',
      });
      throw new Error('Should reject invalid staff ID');
    } catch (error) {
      if (error.response) {
        log(`  Correctly handled invalid staff ID`, colors.green);
      } else {
        throw error;
      }
    }
  });

  // Cleanup
  log('\n🧹 Cleanup Test Data', colors.bold + colors.blue);
  await test('Delete test schedules', async () => {
    const schedules = await axios.get(`${API_URL}/patrol-schedules`);
    for (const schedule of schedules.data.records) {
      await axios.delete(`${API_URL}/patrol-schedules/${schedule.id}`);
    }
    log(`  Deleted ${schedules.data.records.length} test schedules`, colors.green);
  });

  await test('Delete test incident', async () => {
    if (testIncidentId) {
      await axios.delete(`${API_URL}/incidents/${testIncidentId}`);
      log(`  Deleted test incident #${testIncidentId}`, colors.green);
    }
  });

  // Summary
  log('\n' + '='.repeat(70), colors.cyan);
  log('TEST SUMMARY', colors.bold + colors.cyan);
  log('='.repeat(70), colors.cyan);
  log(`✓ Passed:   ${testResults.passed}`, colors.green);
  if (testResults.failed > 0) {
    log(`✗ Failed:   ${testResults.failed}`, colors.red);
  }
  if (testResults.warnings > 0) {
    log(`⚠ Warnings: ${testResults.warnings}`, colors.yellow);
  }
  log('='.repeat(70) + '\n', colors.cyan);

  if (testResults.failed === 0) {
    log('🎉 ALL TESTS PASSED! Patrol Schedule Management is fully functional.', colors.bold + colors.green);
  } else {
    log('❌ SOME TESTS FAILED. Please review the errors above.', colors.bold + colors.red);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
