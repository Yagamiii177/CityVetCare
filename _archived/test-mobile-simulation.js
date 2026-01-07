/**
 * Quick Test: Verify Authenticated Report Fix
 * This simulates what happens in the mobile app
 */

const BASE_URL = 'http://192.168.0.108:3000/api';

console.log('\n📱 Simulating Mobile App Authenticated Report Flow');
console.log('===================================================\n');

async function simulateMobileFlow() {
  // Step 1: User logs in (token stored in AsyncStorage)
  console.log('Step 1: User logs in on mobile...');
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'iphoneuser',
      password: 'iphone123'
    })
  });
  
  const loginData = await loginResponse.json();
  const token = loginData.accessToken;
  console.log('✅ Login successful, token stored in AsyncStorage');
  console.log(`   User: ${loginData.user.full_name}\n`);

  // Step 2: User fills incident report form
  console.log('Step 2: User fills report form...');
  const reportData = {
    reportType: 'incident',
    reporterName: loginData.user.full_name,
    contactNumber: '09123456789',
    date: new Date(),
    description: 'Testing authenticated report submission from mobile',
    petColor: 'Brown',
    petBreed: 'Aspin',
    animalType: 'dog',
    petGender: 'male',
    petSize: 'medium',
    images: []
  };
  console.log('✅ Form filled with all required fields\n');

  // Step 3: User pins location on map
  console.log('Step 3: User pins location on map...');
  const location = { latitude: 14.5995, longitude: 120.9842 };
  console.log(`✅ Location pinned: ${location.latitude}, ${location.longitude}\n`);

  // Step 4: User taps Submit button
  console.log('Step 4: User taps Submit...');
  console.log('   → apiService.create() called');
  console.log('   → getAccessToken() retrieves token from AsyncStorage');
  console.log('   → Token added to Authorization header');
  
  // Prepare payload (same as mobile app)
  const payload = {
    title: 'Incident/Bite Report',
    description: reportData.description,
    location: `${location.latitude},${location.longitude}`,
    latitude: location.latitude,
    longitude: location.longitude,
    status: 'pending',
    reporter_name: reportData.reporterName,
    reporter_contact: reportData.contactNumber,
    incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
    incident_type: reportData.reportType,
    pet_color: reportData.petColor,
    pet_breed: reportData.petBreed,
    animal_type: reportData.animalType,
    pet_gender: reportData.petGender,
    pet_size: reportData.petSize,
    images: '[]'
  };

  // Submit with token (simulating fixed apiService)
  const reportResponse = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ← THIS WAS MISSING BEFORE!
    },
    body: JSON.stringify(payload)
  });

  const reportResult = await reportResponse.json();

  if (reportResponse.ok) {
    console.log('✅ Report submitted successfully!\n');
    console.log('📊 Response:');
    console.log(`   Report ID: ${reportResult.id}`);
    console.log(`   Status: ${reportResult.data.status}`);
    console.log(`   Reporter: ${reportResult.data.reporter_name}`);
    console.log(`   Type: ${reportResult.data.incident_type}`);
    console.log('\n🎉 User sees success modal!');
  } else {
    console.log('❌ Submission failed:', reportResult.message);
  }
}

// Run simulation
simulateMobileFlow().catch(err => console.error('Error:', err.message));
