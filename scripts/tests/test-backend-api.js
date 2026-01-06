import http from 'http';

function testBackendAPI() {
  console.log('🔍 Testing Backend API Endpoints...\n');
  
  const tests = [
    { name: 'Root Endpoint', path: '/' },
    { name: 'Health Check', path: '/api/health' },
    { name: 'Get All Incidents', path: '/api/incidents' },
    { name: 'Get Catcher Teams', path: '/api/catchers' },
    { name: 'Dashboard Stats', path: '/api/dashboard/stats' },
  ];
  
  let completed = 0;
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    setTimeout(() => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: test.path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          completed++;
          if (res.statusCode === 200) {
            passed++;
            console.log(`✅ ${test.name}: PASSED (${res.statusCode})`);
            try {
              const json = JSON.parse(data);
              console.log(`   Response:`, JSON.stringify(json).substring(0, 100) + '...\n');
            } catch (e) {
              console.log(`   Response: ${data.substring(0, 100)}...\n`);
            }
          } else {
            failed++;
            console.log(`❌ ${test.name}: FAILED (${res.statusCode})`);
            console.log(`   Response: ${data}\n`);
          }
          
          if (completed === tests.length) {
            console.log('=================================');
            console.log(`\n📊 Test Summary:`);
            console.log(`   Total: ${tests.length}`);
            console.log(`   Passed: ${passed}`);
            console.log(`   Failed: ${failed}`);
            console.log('=================================\n');
            process.exit(failed > 0 ? 1 : 0);
          }
        });
      });
      
      req.on('error', (error) => {
        completed++;
        failed++;
        console.log(`❌ ${test.name}: ERROR`);
        console.log(`   ${error.message}\n`);
        
        if (completed === tests.length) {
          console.log('=================================');
          console.log(`\n📊 Test Summary:`);
          console.log(`   Total: ${tests.length}`);
          console.log(`   Passed: ${passed}`);
          console.log(`   Failed: ${failed}`);
          console.log('\n💡 Make sure the backend server is running:');
          console.log('   cd Backend-Node && npm start');
          console.log('=================================\n');
          process.exit(1);
        }
      });
      
      req.end();
    }, index * 500); // Stagger requests by 500ms
  });
}

console.log('⏳ Waiting for server to be ready...\n');
setTimeout(testBackendAPI, 2000);
