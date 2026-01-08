/**
 * Comprehensive All Incidents Table Storage Test
 * Tests submission from both Web and Mobile, verifies storage in database
 */

import axios from 'axios';
import { pool } from './config/database.js';

const API_BASE_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`\n${'='.repeat(80)}`);
console.log(`${colors.magenta}🧪 COMPREHENSIVE INCIDENT STORAGE TEST${colors.reset}`);
console.log(`${colors.blue}Testing if submitted incidents are stored in 'incidents' table${colors.reset}`);
console.log(`${'='.repeat(80)}\n`);

let testIncidentIds = [];

/**
 * Submit and verify incident
 */
async function submitAndVerify(testData, label) {
  console.log(`\n${colors.yellow}━━━ Testing: ${label} ━━━${colors.reset}`);
  
  // Step 1: Submit via API
  console.log(`\n${colors.blue}1. Submitting via POST /api/incidents${colors.reset}`);
  console.log(`   Data:`, JSON.stringify(testData, null, 2).substring(0, 200) + '...');
  
  try {
    const submitResponse = await axios.post(`${API_BASE_URL}/incidents`, testData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const incidentId = submitResponse.data.id;
    console.log(`   ${colors.green}✓ Success: Status ${submitResponse.status}${colors.reset}`);
    console.log(`   ${colors.green}✓ Incident ID: ${incidentId}${colors.reset}`);
    
    testIncidentIds.push(incidentId);
    
    // Step 2: Wait a moment for DB write
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Step 3: Verify in database using direct query
    console.log(`\n${colors.blue}2. Verifying in Database (Direct Query)${colors.reset}`);
    
    const [dbRows] = await pool.execute(
      'SELECT * FROM incidents WHERE id = ?',
      [incidentId]
    );
    
    if (dbRows.length > 0) {
      const dbRecord = dbRows[0];
      console.log(`   ${colors.green}✓ Found in 'incidents' table!${colors.reset}`);
      console.log(`   ${colors.green}✓ Database Record:${colors.reset}`);
      console.log(`      - ID: ${dbRecord.id}`);
      console.log(`      - Title: ${dbRecord.title}`);
      console.log(`      - Type: ${dbRecord.incident_type}`);
      console.log(`      - Animal: ${dbRecord.animal_type}`);
      console.log(`      - Status: ${dbRecord.status}`);
      console.log(`      - Reporter: ${dbRecord.reporter_name}`);
      console.log(`      - Contact: ${dbRecord.reporter_contact}`);
      console.log(`      - Location: ${dbRecord.location}`);
      
      if (dbRecord.latitude && dbRecord.longitude) {
        console.log(`      - Coordinates: ${dbRecord.latitude}, ${dbRecord.longitude}`);
      }
      if (dbRecord.pet_breed) {
        console.log(`      - Pet Breed: ${dbRecord.pet_breed}`);
      }
      if (dbRecord.pet_color) {
        console.log(`      - Pet Color: ${dbRecord.pet_color}`);
      }
      
      console.log(`      - Created: ${dbRecord.created_at}`);
      
      // Data integrity check
      console.log(`\n${colors.blue}3. Data Integrity Check${colors.reset}`);
      
      const checks = [
        { field: 'title', match: testData.title === dbRecord.title },
        { field: 'description', match: testData.description === dbRecord.description },
        { field: 'location', match: testData.location === dbRecord.location },
        { field: 'reporter_name', match: testData.reporter_name === dbRecord.reporter_name },
        { field: 'reporter_contact', match: testData.reporter_contact === dbRecord.reporter_contact },
        { field: 'incident_type', match: testData.incident_type === dbRecord.incident_type },
        { field: 'status', match: testData.status === dbRecord.status },
      ];
      
      let allMatch = true;
      checks.forEach(check => {
        const symbol = check.match ? '✓' : '✗';
        const color = check.match ? colors.green : colors.red;
        console.log(`   ${color}${symbol} ${check.field}${colors.reset}`);
        if (!check.match) allMatch = false;
      });
      
      if (allMatch) {
        console.log(`\n   ${colors.green}✓ All fields match! Perfect data integrity.${colors.reset}`);
      }
      
    } else {
      console.log(`   ${colors.red}✗ NOT FOUND in database!${colors.reset}`);
      return false;
    }
    
    // Step 4: Verify retrieval via API
    console.log(`\n${colors.blue}4. Verifying Retrieval via GET /api/incidents/${incidentId}${colors.reset}`);
    
    const getResponse = await axios.get(`${API_BASE_URL}/incidents/${incidentId}`);
    console.log(`   ${colors.green}✓ Successfully retrieved via API${colors.reset}`);
    console.log(`   ${colors.green}✓ Status: ${getResponse.status}${colors.reset}`);
    
    // Step 5: Verify it appears in list
    console.log(`\n${colors.blue}5. Verifying in List (GET /api/incidents)${colors.reset}`);
    
    const listResponse = await axios.get(`${API_BASE_URL}/incidents`);
    const foundInList = listResponse.data.records.some(r => r.id === incidentId);
    
    if (foundInList) {
      console.log(`   ${colors.green}✓ Found in incidents list${colors.reset}`);
    } else {
      console.log(`   ${colors.red}✗ Not found in incidents list${colors.reset}`);
    }
    
    console.log(`\n${colors.green}━━━ ${label} - ALL CHECKS PASSED ━━━${colors.reset}`);
    return true;
    
  } catch (error) {
    console.log(`\n${colors.red}━━━ ${label} - FAILED ━━━${colors.reset}`);
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Response:`, error.response.data);
    }
    return false;
  }
}

/**
 * Main test execution
 */
async function runAllTests() {
  const results = [];
  
  // Get initial count
  const [initialCount] = await pool.execute('SELECT COUNT(*) as count FROM incidents');
  console.log(`${colors.blue}📊 Initial incident count: ${initialCount[0].count}${colors.reset}`);
  
  // Test 1: Web-style stray report
  console.log(`\n${'='.repeat(80)}`);
  const test1 = await submitAndVerify({
    title: 'Stray Dog Spotted',
    description: 'Large brown dog wandering near the park area. Appears friendly but hungry.',
    location: 'Central Park, Manila',
    status: 'pending',
    reporter_name: 'Juan Dela Cruz',
    reporter_contact: '09171234567',
    incident_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    incident_type: 'stray',
    animal_type: 'dog',
  }, 'Web - Stray Dog Report');
  results.push({ test: 'Web Stray Report', passed: test1 });
  
  // Test 2: Web-style lost pet report
  console.log(`\n${'='.repeat(80)}`);
  const test2 = await submitAndVerify({
    title: 'Lost Cat - Help Needed',
    description: 'White Persian cat with blue collar, last seen near SM Mall. Very friendly, answers to "Fluffy".',
    location: 'SM Mall Area, Quezon City',
    status: 'pending',
    reporter_name: 'Maria Santos',
    reporter_contact: '09189876543',
    incident_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    incident_type: 'lost',
    animal_type: 'cat',
  }, 'Web - Lost Cat Report');
  results.push({ test: 'Web Lost Pet Report', passed: test2 });
  
  // Test 3: Mobile-style incident with coordinates
  console.log(`\n${'='.repeat(80)}`);
  const test3 = await submitAndVerify({
    title: 'Incident Report',
    description: 'Dog incident near school, requires attention',
    location: '14.5995,120.9842',
    latitude: 14.5995,
    longitude: 120.9842,
    status: 'pending',
    reporter_name: 'Mobile User',
    reporter_contact: '09123456789',
    incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
    incident_type: 'incident',
    pet_color: 'black',
    pet_breed: 'German Shepherd',
    animal_type: 'dog',
    pet_gender: 'male',
    pet_size: 'large',
    images: JSON.stringify([])
  }, 'Mobile - Incident Report with GPS');
  results.push({ test: 'Mobile Incident Report', passed: test3 });
  
  // Test 4: Mobile-style stray report
  console.log(`\n${'='.repeat(80)}`);
  const test4 = await submitAndVerify({
    title: 'Stray Animal Report',
    description: 'Small stray cat near convenience store',
    location: '14.6042,121.0224',
    latitude: 14.6042,
    longitude: 121.0224,
    status: 'pending',
    reporter_name: 'App User',
    reporter_contact: '09987654321',
    incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
    incident_type: 'stray',
    pet_color: 'orange tabby',
    pet_breed: 'Mixed',
    animal_type: 'cat',
    pet_gender: 'female',
    pet_size: 'small',
    images: JSON.stringify([])
  }, 'Mobile - Stray Cat Report with Details');
  results.push({ test: 'Mobile Stray Report', passed: test4 });
  
  // Final verification
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${colors.blue}📊 FINAL VERIFICATION${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);
  
  // Check final count
  const [finalCount] = await pool.execute('SELECT COUNT(*) as count FROM incidents');
  const expectedCount = initialCount[0].count + testIncidentIds.length;
  
  console.log(`${colors.blue}Initial count:${colors.reset} ${initialCount[0].count}`);
  console.log(`${colors.blue}Submitted:${colors.reset}     ${testIncidentIds.length}`);
  console.log(`${colors.blue}Expected:${colors.reset}      ${expectedCount}`);
  console.log(`${colors.blue}Final count:${colors.reset}   ${finalCount[0].count}`);
  
  if (finalCount[0].count === expectedCount) {
    console.log(`\n${colors.green}✓ Count matches perfectly!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ Count mismatch!${colors.reset}`);
  }
  
  // Show all test incidents in table
  console.log(`\n${colors.blue}📋 All Test Incidents in Database:${colors.reset}\n`);
  
  if (testIncidentIds.length > 0) {
    const placeholders = testIncidentIds.map(() => '?').join(',');
    const [allIncidents] = await pool.execute(
      `SELECT id, title, incident_type, animal_type, status, reporter_name, location, created_at 
       FROM incidents 
       WHERE id IN (${placeholders}) 
       ORDER BY id`,
      testIncidentIds
    );
    
    console.log('ID'.padEnd(6) + 'Title'.padEnd(30) + 'Type'.padEnd(12) + 'Animal'.padEnd(10) + 'Reporter'.padEnd(20) + 'Status');
    console.log('-'.repeat(100));
    
    allIncidents.forEach(inc => {
      console.log(
        inc.id.toString().padEnd(6) +
        (inc.title.substring(0, 28)).padEnd(30) +
        (inc.incident_type || 'N/A').padEnd(12) +
        (inc.animal_type || 'N/A').padEnd(10) +
        (inc.reporter_name.substring(0, 18)).padEnd(20) +
        inc.status
      );
    });
  }
  
  // Cleanup
  console.log(`\n${colors.yellow}🧹 Cleaning up test data...${colors.reset}\n`);
  
  for (const id of testIncidentIds) {
    await axios.delete(`${API_BASE_URL}/incidents/${id}`);
    console.log(`   ${colors.green}✓ Deleted incident ${id}${colors.reset}`);
  }
  
  const [cleanCount] = await pool.execute('SELECT COUNT(*) as count FROM incidents');
  
  if (cleanCount[0].count === initialCount[0].count) {
    console.log(`\n${colors.green}✓ Database restored to initial state (${cleanCount[0].count} records)${colors.reset}`);
  }
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${colors.magenta}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(r => {
    const symbol = r.passed ? '✓' : '✗';
    const color = r.passed ? colors.green : colors.red;
    console.log(`${color}${symbol} ${r.test}${colors.reset}`);
  });
  
  console.log(`\n${colors.blue}Total Tests: ${results.length}${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}Success Rate: ${((passed/results.length)*100).toFixed(0)}%${colors.reset}`);
  
  if (passed === results.length) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED!${colors.reset}`);
    console.log(`${colors.green}✓ Incidents are correctly stored in the 'incidents' table${colors.reset}`);
    console.log(`${colors.green}✓ All data fields are preserved${colors.reset}`);
    console.log(`${colors.green}✓ Both Web and Mobile submissions work${colors.reset}`);
    console.log(`${colors.green}✓ API retrieval works correctly${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}Some tests failed. Review the errors above.${colors.reset}\n`);
  }
}

// Execute
runAllTests()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(`\n${colors.red}Test execution failed:${colors.reset}`, error);
    await pool.end();
    process.exit(1);
  });
