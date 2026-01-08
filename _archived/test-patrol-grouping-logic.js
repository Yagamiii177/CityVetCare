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

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

async function testPatrolGrouping() {
  log('\n' + '='.repeat(80), colors.cyan);
  log('PATROL GROUPING LOGIC - CRITICAL VALIDATION', colors.bold + colors.cyan);
  log('='.repeat(80) + '\n', colors.cyan);

  let testIncidentId;
  let testScheduleId;

  try {
    // Step 0: Check backend connectivity
    log('🔌 Step 0: Checking backend connectivity...', colors.blue);
    try {
      await axios.get(`${API_URL}/health`, { timeout: 5000 });
      log('   ✓ Backend is online and responding', colors.green);
    } catch (error) {
      log('   ✗ Backend is not responding. Please start the backend server.', colors.red);
      throw new Error('Backend server is not running or not accessible');
    }

    // Step 1: Create test incident
    log('\n📝 Step 1: Creating test incident...', colors.blue);
    const incidentData = {
      reporter_name: 'Patrol Test Reporter',
      reporter_contact: '+63 999 888 7777',
      location: 'Test Patrol Area',
      latitude: 14.5995,
      longitude: 120.9842,
      description: 'Test incident for patrol grouping validation',
      incident_date: new Date().toISOString(),
      report_type: 'stray',
      status: 'verified',
      animal_type: 'Dog',
      pet_color: 'Brown',
      pet_breed: 'Mixed',
    };

    const incidentResponse = await axios.post(`${API_URL}/incidents`, incidentData);
    testIncidentId = incidentResponse.data.id;
    log(`   ✓ Created incident #${testIncidentId}`, colors.green);

    // Step 2: Create patrol with MULTIPLE staff (3 members)
    log('\n🎯 Step 2: Creating ONE patrol with 3 staff members...', colors.blue);
    const patrolData = {
      incident_id: testIncidentId,
      assigned_staff_ids: '1,2,3',  // Three staff members
      assigned_staff_names: 'Carlos Mendoza, Maria Santos, Juan Reyes',
      schedule_date: '2026-01-15 10:00:00',
      schedule_time: '10:00',
      status: 'scheduled',
      notes: 'Team patrol - testing group logic',
    };

    const patrolResponse = await axios.post(`${API_URL}/patrol-schedules`, patrolData);
    testScheduleId = patrolResponse.data.id;
    
    log(`   ✓ Created patrol schedule #${testScheduleId}`, colors.green);
    log(`   📊 Staff IDs in request: ${patrolData.assigned_staff_ids}`, colors.green);
    log(`   📊 Response staff count: ${patrolResponse.data.staff_count || 'N/A'}`, colors.green);

    // Step 3: Verify ONLY ONE patrol record was created
    log('\n🔍 Step 3: Verifying ONE patrol record exists...', colors.blue);
    const allSchedules = await axios.get(`${API_URL}/patrol-schedules`);
    const testPatrols = allSchedules.data.records.filter(s => s.incident_id == testIncidentId);
    
    if (testPatrols.length !== 1) {
      log(`   ✗ CRITICAL ERROR: Expected 1 patrol record, found ${testPatrols.length}`, colors.red);
      log(`   ❌ BUG: System created multiple patrol records instead of one patrol group!`, colors.red);
      throw new Error('Patrol grouping logic is broken - multiple records created');
    }
    
    log(`   ✓ CORRECT: Only 1 patrol record exists`, colors.green);

    // Step 4: Verify patrol contains all 3 staff members
    log('\n👥 Step 4: Verifying patrol contains ALL 3 staff members...', colors.blue);
    const patrolDetail = await axios.get(`${API_URL}/patrol-schedules/${testScheduleId}`);
    const patrol = patrolDetail.data.data;
    
    log(`   📋 Assigned Staff IDs: ${patrol.assigned_staff_ids}`, colors.cyan);
    log(`   📋 Assigned Staff IDs Type: ${typeof patrol.assigned_staff_ids}`, colors.cyan);
    log(`   📋 Assigned Staff Names: ${patrol.assigned_staff_names}`, colors.cyan);
    log(`   📋 Staff Count: ${patrol.staff_count}`, colors.cyan);
    
    const staffIds = patrol.assigned_staff_ids ? String(patrol.assigned_staff_ids).split(',') : [];
    
    if (staffIds.length !== 3) {
      log(`   ✗ ERROR: Expected 3 staff members, found ${staffIds.length}`, colors.red);
      throw new Error('Patrol does not contain all staff members');
    }
    
    if (!staffIds.includes('1') || !staffIds.includes('2') || !staffIds.includes('3')) {
      log(`   ✗ ERROR: Staff IDs do not match expected (1,2,3)`, colors.red);
      throw new Error('Staff IDs are incorrect');
    }
    
    log(`   ✓ CORRECT: Patrol contains all 3 staff members as one team`, colors.green);

    // Step 5: Test conflict detection (should detect if ANY staff member conflicts)
    log('\n⚠️  Step 5: Testing conflict detection for patrol groups...', colors.blue);
    
    // Try to create overlapping patrol with staff #2 (who is already in the team)
    const conflictCheck = await axios.post(`${API_URL}/patrol-schedules/check-conflict`, {
      staff_ids: '2,4,5',  // Staff #2 is already in the patrol group
      schedule_date: '2026-01-15 10:30:00',
      schedule_time: '10:30',
    });

    if (!conflictCheck.data.has_conflict) {
      log(`   ✗ ERROR: Should detect conflict with Maria Santos (ID: 2)`, colors.red);
      throw new Error('Conflict detection failed for patrol group');
    }
    
    log(`   ✓ CORRECT: Conflict detected for Maria Santos`, colors.green);
    log(`   📋 Conflicts: ${conflictCheck.data.conflicts.map(c => c.staff_name).join(', ')}`, colors.cyan);

    // Step 6: Verify no conflict with completely different staff
    log('\n✅ Step 6: Testing no conflict with different staff...', colors.blue);
    const noConflictCheck = await axios.post(`${API_URL}/patrol-schedules/check-conflict`, {
      staff_ids: '7,8,9',  // Completely different staff
      schedule_date: '2026-01-15 10:00:00',
      schedule_time: '10:00',
    });

    if (noConflictCheck.data.has_conflict) {
      log(`   ✗ ERROR: Should NOT detect conflict with different staff`, colors.red);
      throw new Error('False positive in conflict detection');
    }
    
    log(`   ✓ CORRECT: No conflict with different staff members`, colors.green);

    // Step 7: Database integrity check
    log('\n🗄️  Step 7: Verifying database integrity...', colors.blue);
    
    // Query database directly to count records
    const dbCheck = await axios.get(`${API_URL}/patrol-schedules?incident_id=${testIncidentId}`);
    const dbPatrols = dbCheck.data.records;
    
    if (dbPatrols.length !== 1) {
      log(`   ✗ CRITICAL: Database has ${dbPatrols.length} records, expected 1`, colors.red);
      throw new Error('Database integrity compromised');
    }
    
    log(`   ✓ Database has exactly 1 patrol record`, colors.green);
    log(`   ✓ assigned_catcher_id field contains: "${dbPatrols[0].assigned_staff_ids}"`, colors.green);

    // Cleanup
    log('\n🧹 Cleanup: Removing test data...', colors.blue);
    await axios.delete(`${API_URL}/patrol-schedules/${testScheduleId}`);
    await axios.delete(`${API_URL}/incidents/${testIncidentId}`);
    log(`   ✓ Cleaned up test data`, colors.green);

    // Success summary
    log('\n' + '='.repeat(80), colors.cyan);
    log('✅ ALL TESTS PASSED - PATROL GROUPING LOGIC IS CORRECT', colors.bold + colors.green);
    log('='.repeat(80), colors.cyan);
    
    log('\n📊 Summary:', colors.bold);
    log('   ✓ One patrol schedule creates ONE database record', colors.green);
    log('   ✓ Multiple staff stored together in one patrol group', colors.green);
    log('   ✓ Conflict detection works for entire patrol team', colors.green);
    log('   ✓ No duplicate patrol records created', colors.green);
    log('   ✓ Database integrity maintained', colors.green);
    
    log('\n🎉 The patrol grouping logic is working correctly!', colors.bold + colors.green);

  } catch (error) {
    log('\n' + '='.repeat(80), colors.red);
    log('❌ TESTS FAILED - PATROL GROUPING LOGIC HAS ERRORS', colors.bold + colors.red);
    log('='.repeat(80), colors.red);
    
    log(`\nError: ${error.message}`, colors.red);
    console.error('\nFull Error Stack:', error.stack);
    
    if (error.response) {
      log(`\nAPI Error Status: ${error.response.status}`, colors.red);
      log(`API Error Data:`, colors.red);
      console.error(JSON.stringify(error.response.data, null, 2));
    }

    // Cleanup on error
    try {
      if (testScheduleId) {
        await axios.delete(`${API_URL}/patrol-schedules/${testScheduleId}`);
      }
      if (testIncidentId) {
        await axios.delete(`${API_URL}/incidents/${testIncidentId}`);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

// Run the test
testPatrolGrouping().catch((error) => {
  log(`\n💥 Unexpected error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
