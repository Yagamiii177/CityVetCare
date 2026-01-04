/**
 * Test authenticated incident report submission
 */

const BASE_URL = 'http://192.168.0.108:3000/api';

async function testAuthenticatedReport() {
  console.log('\n🔐 Testing Authenticated Incident Report');
  console.log('=========================================\n');

  // Step 1: Login to get token
  console.log('Step 1: Login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'iphoneuser',
        password: 'iphone123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.accessToken;
    console.log('✅ Logged in as:', loginData.user.username);
    console.log('   Token:', token ? 'Present ✓' : 'Missing ✗');

    // Step 2: Submit incident WITH token
    console.log('\nStep 2: Submit report WITH authentication...');
    
    const reportData = {
      title: 'Authenticated Mobile Report',
      description: 'Testing authenticated incident submission',
      location: '14.5995,120.9842',
      latitude: 14.5995,
      longitude: 120.9842,
      status: 'pending',
      reporter_name: 'iPhone User',
      reporter_contact: '09123456789',
      incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
      incident_type: 'incident',
      pet_color: 'Brown',
      pet_breed: 'Aspin',
      animal_type: 'dog',
      pet_gender: 'male',
      pet_size: 'medium',
      images: '[]'
    };

    const reportResponse = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });

    const reportResult = await reportResponse.json();

    if (reportResponse.ok) {
      console.log('✅ Report submitted successfully!');
      console.log('   Report ID:', reportResult.id);
      console.log('   Status:', reportResult.data?.status || 'unknown');
    } else {
      console.log('❌ Report submission failed:', reportResult.message);
      console.log('   Details:', reportResult.details || 'No details');
    }

    // Step 3: Submit incident WITHOUT token (emergency report)
    console.log('\nStep 3: Submit report WITHOUT authentication (emergency)...');
    
    const emergencyResponse = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...reportData,
        title: 'Emergency Mobile Report',
        reporter_name: 'Anonymous User'
      })
    });

    const emergencyResult = await emergencyResponse.json();

    if (emergencyResponse.ok) {
      console.log('✅ Emergency report submitted successfully!');
      console.log('   Report ID:', emergencyResult.id);
    } else {
      console.log('❌ Emergency report failed:', emergencyResult.message);
    }

    console.log('\n=========================================');
    console.log('📊 Test Complete');
    console.log('=========================================\n');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAuthenticatedReport();
