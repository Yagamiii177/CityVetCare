/**
 * Create Test Data for CityVetCare System
 * This script creates realistic test data for testing admin monitoring features
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test incidents data
const testIncidents = [
  // PENDING - For Pending Verification page
  {
    title: 'Stray Dog Near School',
    description: 'Large brown dog wandering near elementary school entrance. Appears friendly but could be dangerous to children.',
    location: 'St. Mary Elementary School, Main Street',
    latitude: 13.6218,
    longitude: 123.1948,
    reporter_name: 'Maria Santos',
    reporter_contact: '09171234567',
    incident_type: 'stray',
    animal_type: 'dog',
    pet_breed: 'Aspin (Mixed)',
    pet_color: 'Brown',
    pet_gender: 'male',
    pet_size: 'large',
    status: 'pending'
  },
  {
    title: 'Dog Bite Incident',
    description: 'Patient bitten by neighborhood dog while jogging. Wound cleaned and treated. Dog owner unknown.',
    location: 'Riverside Park Jogging Trail',
    latitude: 13.6250,
    longitude: 123.1960,
    reporter_name: 'John Reyes',
    reporter_contact: '09181234567',
    incident_type: 'incident',
    animal_type: 'dog',
    pet_breed: 'German Shepherd mix',
    pet_color: 'Black and Tan',
    pet_gender: 'unknown',
    pet_size: 'large',
    status: 'pending'
  },
  {
    title: 'Lost Pet Cat',
    description: 'Orange tabby cat missing since yesterday. Wearing blue collar with bell. Very friendly.',
    location: 'Sunshine Village Subdivision',
    latitude: 13.6200,
    longitude: 123.1930,
    reporter_name: 'Lisa Cruz',
    reporter_contact: '09191234567',
    incident_type: 'lost',
    animal_type: 'cat',
    pet_breed: 'Domestic Shorthair',
    pet_color: 'Orange',
    pet_gender: 'female',
    pet_size: 'small',
    status: 'pending'
  },
  
  // VERIFIED - For Monitoring page (active incidents)
  {
    title: 'Multiple Stray Dogs in Barangay',
    description: 'Pack of 5-6 stray dogs reported in residential area. Residents concerned about safety.',
    location: 'Barangay San Jose, Zone 3',
    latitude: 13.6280,
    longitude: 123.1980,
    reporter_name: 'Barangay Captain',
    reporter_contact: '09201234567',
    incident_type: 'stray',
    animal_type: 'dog',
    pet_breed: 'Mixed Breeds',
    pet_color: 'Various',
    pet_gender: 'unknown',
    pet_size: 'medium',
    status: 'verified'
  },
  {
    title: 'Injured Stray Cat',
    description: 'Cat found with leg injury. Appears malnourished and in need of medical attention.',
    location: 'City Market Parking Area',
    latitude: 13.6190,
    longitude: 123.1920,
    reporter_name: 'Market Vendor Association',
    reporter_contact: '09211234567',
    incident_type: 'stray',
    animal_type: 'cat',
    pet_breed: 'Local Cat',
    pet_color: 'Gray and White',
    pet_gender: 'female',
    pet_size: 'small',
    status: 'verified'
  },
  
  // IN PROGRESS - For Monitoring page
  {
    title: 'Aggressive Dog in Public Area',
    description: 'Dog showing aggressive behavior near public plaza. Catcher team dispatched.',
    location: 'City Plaza',
    latitude: 13.6230,
    longitude: 123.1950,
    reporter_name: 'Plaza Security',
    reporter_contact: '09221234567',
    incident_type: 'incident',
    animal_type: 'dog',
    pet_breed: 'Rottweiler mix',
    pet_color: 'Black',
    pet_gender: 'male',
    pet_size: 'large',
    status: 'in_progress'
  },
  
  // RESOLVED - Should not appear in monitoring
  {
    title: 'Rescued Puppy',
    description: 'Abandoned puppy found and rescued. Successfully placed in shelter.',
    location: 'Old Highway Road',
    latitude: 13.6180,
    longitude: 123.1910,
    reporter_name: 'Anonymous',
    reporter_contact: '09231234567',
    incident_type: 'stray',
    animal_type: 'dog',
    pet_breed: 'Puppy',
    pet_color: 'White',
    pet_gender: 'male',
    pet_size: 'small',
    status: 'resolved'
  }
];

async function createTestData() {
  console.log('🚀 Creating Test Data for CityVetCare');
  console.log('=====================================\n');

  try {
    // Check if server is running
    const health = await makeRequest('GET', '/api/health');
    if (health.status !== 200) {
      console.error('❌ Backend server is not running!');
      console.log('Please start the server: cd Backend-Node && npm start');
      process.exit(1);
    }

    console.log('✅ Backend server is running\n');

    // Create test incidents
    console.log('📝 Creating test incidents...\n');
    const createdIds = [];

    for (const incident of testIncidents) {
      const incidentData = {
        ...incident,
        incident_date: new Date().toISOString().split('T')[0] + ' ' + 
                      new Date().toTimeString().split(' ')[0],
        images: []
      };

      const result = await makeRequest('POST', '/api/incidents', incidentData);
      
      if (result.status === 201) {
        createdIds.push(result.data.id);
        console.log(`✅ Created: ${incident.title} (ID: ${result.data.id}, Status: ${incident.status})`);
      } else {
        console.log(`❌ Failed: ${incident.title}`);
        console.log(`   Error: ${JSON.stringify(result.data)}`);
      }
    }

    console.log('\n=====================================');
    console.log('📊 Test Data Summary');
    console.log('=====================================');
    console.log(`Total incidents created: ${createdIds.length}`);
    
    // Get counts by status
    const allIncidents = await makeRequest('GET', '/api/incidents');
    const incidents = allIncidents.data.records || [];
    
    const statusCounts = {
      pending: incidents.filter(i => i.status === 'pending').length,
      verified: incidents.filter(i => i.status === 'verified').length,
      in_progress: incidents.filter(i => i.status === 'in_progress').length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
      rejected: incidents.filter(i => i.status === 'rejected').length
    };

    console.log(`\nStatus Distribution:`);
    console.log(`  Pending: ${statusCounts.pending} (for Pending Verification page)`);
    console.log(`  Verified: ${statusCounts.verified} (for Monitoring page)`);
    console.log(`  In Progress: ${statusCounts.in_progress} (for Monitoring page)`);
    console.log(`  Resolved: ${statusCounts.resolved} (completed)`);
    console.log(`  Rejected: ${statusCounts.rejected}`);

    console.log('\n=====================================');
    console.log('🎯 Testing Scenarios Created:');
    console.log('=====================================');
    console.log('1. Pending Verification Page:');
    console.log('   - Should show 3 pending incidents');
    console.log('   - Test approval/rejection workflow');
    console.log('\n2. Incident Monitoring Page:');
    console.log('   - Should show 3 active incidents (verified + in_progress)');
    console.log('   - Should NOT show pending or resolved');
    console.log('   - Test map view with incident markers');
    console.log('\n3. All Incident Reports:');
    console.log(`   - Should show all ${incidents.length} incidents`);
    console.log('   - Test filtering and search');
    console.log('\n=====================================');
    console.log('✅ Test data created successfully!');
    console.log('=====================================\n');

    // Test dashboard
    console.log('📊 Testing Dashboard...');
    const dashboard = await makeRequest('GET', '/api/dashboard');
    if (dashboard.status === 200) {
      console.log('✅ Dashboard API working');
      console.log(`   Total Incidents: ${dashboard.data.summary?.total_incidents || 0}`);
      console.log(`   Pending: ${dashboard.data.summary?.pending_incidents || 0}`);
      console.log(`   Verified: ${dashboard.data.summary?.verified_incidents || dashboard.data.summary?.approved_incidents || 0}`);
      console.log(`   In Progress: ${dashboard.data.summary?.in_progress_incidents || 0}`);
    } else {
      console.log('⚠️  Dashboard API issue');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
console.log('⏳ Waiting for server...\n');
setTimeout(createTestData, 1000);
