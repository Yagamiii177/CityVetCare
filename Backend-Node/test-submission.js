/**
 * Test Incident Submission - Simulates Frontend Submission
 * This script simulates exactly what the frontend does when submitting a report
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

console.log(`\n${'='.repeat(70)}`);
console.log(`${colors.blue}Testing Incident Submission (Frontend Simulation)${colors.reset}`);
console.log(`${'='.repeat(70)}\n`);

// Test data that matches what frontends send
const testIncident = {
  // Web frontend format
  title: 'Test Stray Dog Report',
  description: 'A stray dog was spotted wandering near the park.\n\nAnimal Type: dog\nAnimal Count: 1',
  location: 'Central Park, Main Entrance',
  status: 'pending',
  priority: 'medium',
  reporter_name: 'Test User',
  reporter_contact: '09123456789',
  incident_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
  incident_type: 'stray',
  animal_type: 'dog',
};

const testMobileIncident = {
  // Mobile frontend format
  title: 'Stray Animal Report',
  description: 'Found stray dog near school',
  location: '14.5995,120.9842', // Lat,Long format
  latitude: 14.5995,
  longitude: 120.9842,
  status: 'pending',
  reporter_name: 'Mobile User',
  reporter_contact: '09987654321',
  incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
  incident_type: 'stray',
  pet_color: 'brown',
  pet_breed: 'Aspin',
  animal_type: 'dog',
  pet_gender: 'male',
  pet_size: 'medium',
  images: JSON.stringify([]) // Mobile sends stringified array
};

async function testSubmission(data, label) {
  console.log(`\n${colors.yellow}Testing: ${label}${colors.reset}`);
  console.log(`${colors.blue}Data:${colors.reset}`, JSON.stringify(data, null, 2));
  
  try {
    const startTime = Date.now();
    const response = await axios.post(`${API_BASE_URL}/incidents`, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    const duration = Date.now() - startTime;
    
    console.log(`\n${colors.green}✓ SUCCESS!${colors.reset} (${duration}ms)`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
    // Clean up - delete the test incident
    if (response.data.id) {
      await axios.delete(`${API_BASE_URL}/incidents/${response.data.id}`);
      console.log(`${colors.blue}ℹ Cleaned up test incident #${response.data.id}${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`\n${colors.red}✗ FAILED${colors.reset}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`${colors.red}Error: Backend server not running${colors.reset}`);
      console.log(`\nStart the backend server with:`);
      console.log(`  cd Backend-Node`);
      console.log(`  npm start`);
    } else if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 404) {
        console.log(`\n${colors.yellow}⚠ Endpoint not found!${colors.reset}`);
        console.log(`Expected: POST ${API_BASE_URL}/incidents`);
        console.log(`Check if backend routes are properly configured.`);
      } else if (error.response.status === 500) {
        console.log(`\n${colors.yellow}⚠ Server error!${colors.reset}`);
        console.log(`This usually means database or backend logic issue.`);
      }
    } else if (error.request) {
      console.log(`${colors.red}Error: No response from server${colors.reset}`);
      console.log(`\nPossible causes:`);
      console.log(`  1. Backend server not running`);
      console.log(`  2. Wrong API URL (currently: ${API_BASE_URL})`);
      console.log(`  3. Network/firewall blocking connection`);
    } else {
      console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    }
    
    return false;
  }
}

async function testHealthFirst() {
  console.log(`${colors.blue}Step 1: Testing Backend Health${colors.reset}`);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    console.log(`${colors.green}✓ Backend is running and healthy${colors.reset}`);
    console.log(`  Status: ${response.data.status}`);
    console.log(`  Uptime: ${Math.floor(response.data.uptime)} seconds`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Backend health check failed${colors.reset}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`\n${colors.red}Backend server is not running!${colors.reset}`);
      console.log(`\nPlease start the backend first:`);
      console.log(`  cd Backend-Node`);
      console.log(`  npm start`);
      console.log(`\nThen run this test again.`);
    }
    
    return false;
  }
}

async function runTests() {
  // Test 1: Health check
  const healthOk = await testHealthFirst();
  
  if (!healthOk) {
    console.log(`\n${colors.yellow}Cannot continue without backend running.${colors.reset}`);
    process.exit(1);
  }
  
  // Test 2: Web-style submission
  console.log(`\n${'='.repeat(70)}`);
  const webSuccess = await testSubmission(testIncident, 'Web Frontend Submission');
  
  // Test 3: Mobile-style submission
  console.log(`\n${'='.repeat(70)}`);
  const mobileSuccess = await testSubmission(testMobileIncident, 'Mobile Frontend Submission');
  
  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Health Check:    ${healthOk ? colors.green + '✓ Pass' : colors.red + '✗ Fail'}${colors.reset}`);
  console.log(`Web Submission:  ${webSuccess ? colors.green + '✓ Pass' : colors.red + '✗ Fail'}${colors.reset}`);
  console.log(`Mobile Submission: ${mobileSuccess ? colors.green + '✓ Pass' : colors.red + '✗ Fail'}${colors.reset}`);
  console.log(`${'='.repeat(70)}\n`);
  
  if (healthOk && webSuccess && mobileSuccess) {
    console.log(`${colors.green}🎉 All tests passed! Endpoints are working correctly.${colors.reset}\n`);
    console.log(`${colors.blue}If you're still seeing "no endpoint detected" in your frontend:${colors.reset}`);
    console.log(`  1. Check browser/app console for exact error`);
    console.log(`  2. Verify .env file in Frontend/web/.env`);
    console.log(`  3. Verify api-config.js in Frontend/mobile/config/`);
    console.log(`  4. Make sure both use: http://localhost:3000/api (or your PC's IP for mobile)`);
    console.log(`  5. See TROUBLESHOOTING_NO_ENDPOINT.md for detailed help\n`);
  } else {
    console.log(`${colors.red}Some tests failed. Check the errors above.${colors.reset}\n`);
  }
  
  process.exit(webSuccess && mobileSuccess ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Test execution failed:${colors.reset}`, error.message);
  process.exit(1);
});
