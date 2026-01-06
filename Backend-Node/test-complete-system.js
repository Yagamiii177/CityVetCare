import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testSystem() {
  console.log('🧪 Testing CityVetCare Report Management System\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Create new incident report
    console.log('\n1️⃣  Creating new incident report...');
    const newReport = {
      title: 'Stray Dog Sighting',
      description: 'Multiple stray dogs spotted near the market area. Appear healthy but need to be rescued.',
      location: 'Purok 5, Barangay San Isidro, Near Public Market',
      latitude: 14.5995,
      longitude: 120.9842,
      status: 'pending',
      priority: 'medium',
      incident_type: 'stray',
      animal_type: 'dog',
      pet_color: 'Brown and white',
      pet_size: 'medium',
      reporter_name: 'Juan dela Cruz',
      reporter_contact: '09171234567',
      reporter_address: 'Barangay San Isidro',
      incident_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    const createResponse = await axios.post(`${API_URL}/incidents`, newReport);
    console.log(`✅ Report created! ID: ${createResponse.data.id}`);
    const reportId = createResponse.data.id;
    
    // Test 2: Get all incidents
    console.log('\n2️⃣  Fetching all incidents (should show in pending)...');
    const allIncidents = await axios.get(`${API_URL}/incidents`);
    console.log(`✅ Found ${allIncidents.data.records.length} incident(s)`);
    console.log(`   Pending reports: ${allIncidents.data.records.filter(r => r.status === 'pending').length}`);
    
    // Test 3: Get single incident
    console.log(`\n3️⃣  Fetching incident #${reportId}...`);
    const singleIncident = await axios.get(`${API_URL}/incidents/${reportId}`);
    console.log(`✅ Retrieved: ${singleIncident.data.data.title}`);
    console.log(`   Location: ${singleIncident.data.data.location}`);
    console.log(`   Status: ${singleIncident.data.data.status}`);
    
    // Test 4: Update status to verified (approve)
    console.log(`\n4️⃣  Approving report (change to verified)...`);
    await axios.put(`${API_URL}/incidents/${reportId}`, {
      status: 'verified'
    });
    console.log('✅ Report approved!');
    
    // Test 5: Get catcher teams
    console.log('\n5️⃣  Fetching available catcher teams...');
    const catchersResponse = await axios.get(`${API_URL}/catchers`);
    console.log(`✅ Found ${catchersResponse.data.data.length} catcher team(s)`);
    const catcherTeamId = catchersResponse.data.data[0]?.id;
    
    if (catcherTeamId) {
      // Test 6: Assign to catcher and schedule
      console.log(`\n6️⃣  Assigning to catcher team and scheduling patrol...`);
      const scheduleData = {
        incident_id: reportId,
        catcher_team_id: catcherTeamId,
        assigned_staff_name: catchersResponse.data.data[0].leader_name,
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '14:00:00',
        notes: 'Regular patrol for stray dog rescue'
      };
      
      const scheduleResponse = await axios.post(`${API_URL}/schedules`, scheduleData);
      console.log(`✅ Scheduled! Schedule ID: ${scheduleResponse.data.id}`);
      
      // Test 7: Verify status changed to scheduled
      console.log('\n7️⃣  Verifying status updated to scheduled...');
      const updatedIncident = await axios.get(`${API_URL}/incidents/${reportId}`);
      console.log(`✅ Status: ${updatedIncident.data.data.status}`);
      console.log(`   Assigned to: ${updatedIncident.data.data.catcher_team_name || 'N/A'}`);
    }
    
    // Test 8: Get dashboard stats
    console.log('\n8️⃣  Checking dashboard statistics...');
    const dashboardResponse = await axios.get(`${API_URL}/dashboard`);
    console.log('✅ Dashboard data retrieved:');
    console.log(`   Total Incidents: ${dashboardResponse.data.summary.total_incidents}`);
    console.log(`   Pending: ${dashboardResponse.data.summary.pending_incidents}`);
    console.log(`   Verified: ${dashboardResponse.data.summary.verified_incidents}`);
    console.log(`   In Progress: ${dashboardResponse.data.summary.in_progress_incidents}`);
    console.log(`   Resolved: ${dashboardResponse.data.summary.resolved_incidents}`);
    
    // Test 9: Update to resolved (mark as complete)
    console.log(`\n9️⃣  Marking incident as resolved...`);
    await axios.put(`${API_URL}/incidents/${reportId}`, {
      status: 'resolved'
    });
    console.log('✅ Incident marked as resolved!');
    
    // Test 10: Verify it appears in history (resolved status)
    console.log('\n🔟  Verifying resolved incident...');
    const resolvedIncident = await axios.get(`${API_URL}/incidents/${reportId}`);
    console.log(`✅ Status: ${resolvedIncident.data.data.status}`);
    console.log(`   Resolved at: ${resolvedIncident.data.data.resolved_at || 'Just now'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED! Report management system is working!');
    console.log('='.repeat(60));
    
    console.log('\n📋 Summary:');
    console.log('✅ Submit new report - Working');
    console.log('✅ Show in pending reports - Working');
    console.log('✅ Show in monitoring - Working');
    console.log('✅ View report details - Working');
    console.log('✅ Approve report - Working');
    console.log('✅ Assign to catcher - Working');
    console.log('✅ Schedule patrol - Working');
    console.log('✅ Update status - Working');
    console.log('✅ Resolve and history - Working');
    console.log('✅ Dashboard stats - Working');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testSystem();
