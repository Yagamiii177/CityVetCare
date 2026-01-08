/**
 * Test authenticated pet owner incident report submission
 * This test validates the critical path that is failing
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Test data
const TEST_CREDENTIALS = {
  username: 'test@owner.com', // Test owner created with proper bcrypt hash
  password: 'testpass123',
  userType: 'pet_owner'
};

async function testAuthenticatedReport() {
  console.log('\n🔬 Testing Authenticated Incident Report Submission\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Login as pet owner
    console.log('\n📝 Step 1: Logging in as pet owner...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS);
    
    const loginData = loginResponse.data;
    
    console.log('✅ Login successful');
    console.log('   User ID:', loginData.userId);
    console.log('   User Type:', loginData.userType);
    console.log('   Token:', loginData.token ? 'Present' : 'Missing');
    
    // Decode token to inspect payload
    const tokenParts = loginData.token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('   Token Payload:', JSON.stringify(payload, null, 2));
    
    // Step 2: Submit incident report as authenticated user
    console.log('\n📝 Step 2: Submitting incident report...');
    
    const reportData = {
      incident_type: 'stray',
      description: 'Test authenticated report - stray dog in neighborhood',
      location: 'Test Location via Authenticated API',
      latitude: 14.5995,
      longitude: 120.9842,
      reporter_name: 'Authenticated Test User',
      reporter_contact: '09123456789',
      animal_type: 'dog',
      pet_color: 'brown',
      pet_size: 'medium'
    };
    
    const reportResponse = await axios.post(`${API_BASE}/incidents`, reportData, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const reportResult = reportResponse.data;
    
    console.log('✅ Report submission successful');
    console.log('   Report ID:', reportResult.id);
    console.log('   Response:', JSON.stringify(reportResult, null, 2));
    
    // Step 3: Verify report appears in "My Reports"
    console.log('\n📝 Step 3: Fetching "My Reports"...');
    
    const myReportsResponse = await axios.get(`${API_BASE}/incidents/my-reports`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const myReportsData = myReportsResponse.data;
    
    console.log('✅ My Reports fetched successfully');
    console.log('   Total Reports:', myReportsData.total || myReportsData.data?.length || 0);
    
    // Check if our report appears
    const ourReport = myReportsData.data?.find(r => r.id === reportResult.id);
    if (ourReport) {
      console.log('   ✅ Our report appears in My Reports');
      console.log('   Report:', JSON.stringify(ourReport, null, 2));
    } else {
      console.log('   ⚠️  Our report NOT found in My Reports');
      console.log('   All Reports:', JSON.stringify(myReportsData.data, null, 2));
    }
    
    // Step 4: Test Emergency (anonymous) submission still works
    console.log('\n📝 Step 4: Testing emergency (anonymous) submission...');
    
    const emergencyData = {
      incident_type: 'stray',
      description: 'Test emergency anonymous report',
      location: 'Emergency Location',
      latitude: 14.5995,
      longitude: 120.9842,
      reporter_name: 'Anonymous Reporter',
      reporter_contact: '09999999999',
      animal_type: 'dog'
    };
    
    const emergencyResponse = await axios.post(`${API_BASE}/incidents`, emergencyData);
    
    const emergencyResult = emergencyResponse.data;
    
    console.log('✅ Emergency submission successful');
    console.log('   Report ID:', emergencyResult.id);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Stack:', error.stack);
  }
}

// Run test
testAuthenticatedReport();
