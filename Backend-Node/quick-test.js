import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

async function quickTest() {
  try {
    console.log('Testing incidents API...\n');
    
    // Test 1: Create incident
    const newReport = {
      title: 'Test Stray Dog',
      description: 'Found stray dog near market',
      location: 'Barangay San Isidro',
      latitude: 14.5995,
      longitude: 120.9842,
      incident_type: 'stray',
      animal_type: 'dog',
      reporter_name: 'Test User',
      reporter_contact: '09123456789'
    };
    
    console.log('1. Creating report...');
    const createRes = await fetch(`${API_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport)
    });
    const created = await createRes.json();
    console.log('✅ Created:', created.id);
    
    // Test 2: Get all
    console.log('\n2. Getting all incidents...');
    const allRes = await fetch(`${API_URL}/incidents`);
    const all = await allRes.json();
    console.log(`✅ Found ${all.records.length} incidents`);
    
    // Test 3: Get by ID
    console.log(`\n3. Getting incident #${created.id}...`);
    const oneRes = await fetch(`${API_URL}/incidents/${created.id}`);
    const one = await oneRes.json();
    console.log('✅ Got:', one.data.title);
    
    // Test 4: Update status
    console.log('\n4. Updating to verified...');
    await fetch(`${API_URL}/incidents/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'verified' })
    });
    console.log('✅ Updated');
    
    // Test 5: Dashboard
    console.log('\n5. Getting dashboard...');
    const dashRes = await fetch(`${API_URL}/dashboard`);
    const dash = await dashRes.json();
    console.log('✅ Dashboard:', {
      total: dash.summary.total_incidents,
      pending: dash.summary.pending_incidents,
      verified: dash.summary.verified_incidents
    });
    
    console.log('\n✅ ALL TESTS PASSED!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();
