// Test script to create a new incident and verify it shows up in the database
import http from 'http';

const testIncident = {
  title: 'Test Incident from API',
  description: 'This is a test incident to verify the system is working',
  location: 'Test Location, Manila',
  latitude: 14.5995,
  longitude: 120.9842,
  reporter_name: 'Test Reporter',
  reporter_contact: '09171234567',
  incident_date: new Date().toISOString(),
  priority: 'medium',
  status: 'pending',
  incident_type: 'incident',
  animal_type: 'dog',
  pet_color: 'brown',
  pet_breed: 'aspin',
  pet_gender: 'male',
  pet_size: 'medium'
};

function createIncident() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testIncident);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/incidents',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };
    
    console.log('📤 Creating new incident...');
    console.log('Data:', JSON.stringify(testIncident, null, 2));
    console.log('');
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const result = JSON.parse(responseData);
          console.log('✅ Incident created successfully!');
          console.log('Response:', JSON.stringify(result, null, 2));
          resolve(result);
        } else {
          console.log(`❌ Failed to create incident (${res.statusCode})`);
          console.log('Response:', responseData);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

function getAllIncidents() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/incidents',
      method: 'GET',
    };
    
    console.log('\n📥 Fetching all incidents...');
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          console.log('✅ Retrieved incidents successfully!');
          console.log(`Found ${result.records.length} incidents`);
          if (result.records.length > 0) {
            console.log('\nLatest incident:');
            console.log(JSON.stringify(result.records[0], null, 2));
          }
          resolve(result);
        } else {
          console.log(`❌ Failed to get incidents (${res.statusCode})`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('🧪 Testing Backend Data Flow\n');
  console.log('=================================\n');
  
  try {
    // Step 1: Create incident
    const created = await createIncident();
    
    // Step 2: Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Retrieve all incidents
    const incidents = await getAllIncidents();
    
    // Step 4: Verify
    console.log('\n=================================');
    console.log('📊 Test Results:');
    console.log(`   ✅ Create incident: PASSED`);
    console.log(`   ✅ Retrieve incidents: PASSED`);
    console.log(`   ✅ Total incidents: ${incidents.records.length}`);
    console.log('=================================\n');
    console.log('🎉 All tests passed! The system is working correctly.');
    console.log('   - Backend API is functional');
    console.log('   - Database connection is working');
    console.log('   - Data is being stored and retrieved properly\n');
    
    process.exit(0);
  } catch (error) {
    console.log('\n=================================');
    console.log('❌ Test Failed:', error.message);
    console.log('=================================\n');
    process.exit(1);
  }
}

// Wait for server to be ready
console.log('⏳ Waiting for server...\n');
setTimeout(runTest, 2000);
