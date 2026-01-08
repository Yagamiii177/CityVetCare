// Test script to verify incident data is accessible via API
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

async function testIncidentAPI() {
  console.log('🧪 Testing Incident Report API...\n');
  
  try {
    // Test 1: Get all incidents
    console.log('📋 Test 1: Fetching all incidents...');
    const response = await axios.get(`${API_BASE}/api/incidents`);
    console.log(`✅ Success! Found ${response.data.incidents.length} incidents`);
    console.log(`   Pagination: Page ${response.data.pagination.page} of ${response.data.pagination.totalPages}`);
    console.log(`   Total records: ${response.data.pagination.totalRecords}\n`);
    
    // Display first few incidents
    console.log('📊 Sample incidents:');
    response.data.incidents.slice(0, 3).forEach((incident, index) => {
      console.log(`\n${index + 1}. ${incident.title}`);
      console.log(`   Status: ${incident.status}`);
      console.log(`   Type: ${incident.incident_type}`);
      console.log(`   Location: ${incident.location}`);
      console.log(`   Reporter: ${incident.reporter_name}`);
      console.log(`   Date: ${incident.created_at}`);
    });
    
    // Test 2: Get incidents by status
    console.log('\n\n📋 Test 2: Fetching pending incidents...');
    const pendingResponse = await axios.get(`${API_BASE}/api/incidents?status=pending`);
    console.log(`✅ Found ${pendingResponse.data.incidents.length} pending incidents\n`);
    
    // Test 3: Get incidents by type
    console.log('📋 Test 3: Fetching stray animal reports...');
    const strayResponse = await axios.get(`${API_BASE}/api/incidents?incident_type=stray`);
    console.log(`✅ Found ${strayResponse.data.incidents.length} stray animal reports\n`);
    
    // Test 4: Get single incident
    if (response.data.incidents.length > 0) {
      const firstIncidentId = response.data.incidents[0].id;
      console.log(`📋 Test 4: Fetching incident #${firstIncidentId} details...`);
      const singleResponse = await axios.get(`${API_BASE}/api/incidents/${firstIncidentId}`);
      console.log(`✅ Successfully fetched incident: ${singleResponse.data.title}\n`);
    }
    
    // Test 5: Status counts
    console.log('📋 Test 5: Getting status counts...');
    const statusCounts = {};
    const allStatuses = ['pending', 'verified', 'in_progress', 'assigned', 'scheduled', 'resolved'];
    
    for (const status of allStatuses) {
      const statusResponse = await axios.get(`${API_BASE}/api/incidents?status=${status}`);
      statusCounts[status] = statusResponse.data.pagination.totalRecords;
    }
    
    console.log('✅ Status counts:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    console.log('\n✅ All API tests passed!\n');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testIncidentAPI();
