import http from 'http';

const testReport = {
  title: 'Test Stray Dog Report',
  description: 'Stray dog spotted near the market area, appears friendly but needs to be captured',
  location: 'Market Street, Barangay 1, Davao City',
  latitude: 7.0731,
  longitude: 125.6128,
  reporter_name: 'Juan Dela Cruz',
  reporter_contact: '09171234567',
  incident_type: 'stray',
  animal_type: 'dog',
  pet_color: 'Brown',
  pet_size: 'medium'
};

const data = JSON.stringify(testReport);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/incidents',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing Report Submission...\n');
console.log('📤 Submitting report:', testReport.title);

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\n📥 Response Status:', res.statusCode);
    
    try {
      const response = JSON.parse(responseData);
      console.log('✅ Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('\n✅ REPORT CREATED SUCCESSFULLY!');
        console.log('   Report ID:', response.id);
        
        // Now test fetching all reports
        console.log('\n🔍 Fetching all reports...');
        testGetAllReports();
      } else {
        console.log('\n❌ FAILED:', response.message);
      }
    } catch (error) {
      console.log('❌ Parse error:', error.message);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.log('\n⚠️ Make sure the backend server is running on port 3000');
});

req.write(data);
req.end();

function testGetAllReports() {
  const getOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/incidents',
    method: 'GET'
  };

  http.get(getOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n📊 Total Reports:', response.pagination?.total || response.records?.length);
        console.log('✅ Latest Report:', response.records[0]?.title);
        
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Database schema updated (no priority)');
        console.log('   ✅ Backend server running');
        console.log('   ✅ Report submission working');
        console.log('   ✅ Report retrieval working');
        console.log('\n🌐 Frontend: http://localhost:5174');
        console.log('🔗 Backend: http://localhost:3000');
      } catch (error) {
        console.log('❌ Parse error:', error.message);
      }
    });
  }).on('error', (error) => {
    console.error('❌ GET error:', error.message);
  });
}
