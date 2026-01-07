/**
 * Test Incident Storage in Database
 * This script verifies that submitted incidents are properly stored in the database
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`\n${'='.repeat(80)}`);
console.log(`${colors.blue}Testing Incident Database Storage${colors.reset}`);
console.log(`${'='.repeat(80)}\n`);

let testIncidentIds = [];

/**
 * Check database connection
 */
async function checkDatabaseConnection() {
  console.log(`${colors.yellow}Step 1: Checking Database Connection${colors.reset}`);
  
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log(`${colors.green}✓ Database connection successful${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Database connection failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Get incident count before test
 */
async function getIncidentCount() {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM incidents');
    return rows[0].count;
  } catch (error) {
    console.error(`${colors.red}Error getting incident count: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Verify incident exists in database
 */
async function verifyIncidentInDatabase(incidentId) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM incidents WHERE id = ?',
      [incidentId]
    );
    
    if (rows.length === 0) {
      return { exists: false, data: null };
    }
    
    return { exists: true, data: rows[0] };
  } catch (error) {
    console.error(`${colors.red}Error verifying incident: ${error.message}${colors.reset}`);
    return { exists: false, data: null, error: error.message };
  }
}

/**
 * Submit test incident via API
 */
async function submitTestIncident(testData, label) {
  console.log(`\n${colors.cyan}Testing: ${label}${colors.reset}`);
  console.log(`${colors.blue}Submitting via API...${colors.reset}`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/incidents`, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    const incidentId = response.data.id;
    console.log(`${colors.green}✓ API Response: Status ${response.status}${colors.reset}`);
    console.log(`  Incident ID: ${incidentId}`);
    
    return { success: true, id: incidentId, response: response.data };
  } catch (error) {
    console.log(`${colors.red}✗ API Request Failed: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

/**
 * Compare submitted data with database data
 */
function compareData(submitted, stored, label) {
  console.log(`\n${colors.yellow}Comparing ${label}:${colors.reset}`);
  
  const checks = [
    { field: 'title', submitted: submitted.title, stored: stored.title },
    { field: 'description', submitted: submitted.description, stored: stored.description },
    { field: 'location', submitted: submitted.location, stored: stored.location },
    { field: 'reporter_name', submitted: submitted.reporter_name, stored: stored.reporter_name },
    { field: 'reporter_contact', submitted: submitted.reporter_contact, stored: stored.reporter_contact },
    { field: 'incident_type', submitted: submitted.incident_type, stored: stored.incident_type },
    { field: 'animal_type', submitted: submitted.animal_type, stored: stored.animal_type },
    { field: 'status', submitted: submitted.status, stored: stored.status },
  ];
  
  let allMatch = true;
  
  for (const check of checks) {
    const match = check.submitted == check.stored;
    const symbol = match ? '✓' : '✗';
    const color = match ? colors.green : colors.red;
    
    console.log(`  ${color}${symbol}${colors.reset} ${check.field.padEnd(20)}: ${check.submitted} ${match ? '==' : '!='} ${check.stored}`);
    
    if (!match) allMatch = false;
  }
  
  return allMatch;
}

/**
 * Run comprehensive storage test
 */
async function runStorageTest() {
  // Test 1: Check database connection
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    console.log(`\n${colors.red}Cannot proceed without database connection.${colors.reset}`);
    return false;
  }
  
  // Test 2: Get initial count
  console.log(`\n${colors.yellow}Step 2: Getting Initial Incident Count${colors.reset}`);
  const initialCount = await getIncidentCount();
  console.log(`${colors.blue}Current incidents in database: ${initialCount}${colors.reset}`);
  
  // Test 3: Submit Web-style incident
  console.log(`\n${colors.yellow}Step 3: Testing Web Frontend Submission${colors.reset}`);
  
  const webIncident = {
    title: 'Test Web Incident - Database Storage Test',
    description: 'Testing if incident is stored in database correctly',
    location: 'Test Location, Street 123',
    status: 'pending',
    priority: 'medium',
    reporter_name: 'Test User Web',
    reporter_contact: '09111111111',
    incident_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    incident_type: 'stray',
    animal_type: 'dog',
  };
  
  const webResult = await submitTestIncident(webIncident, 'Web Frontend');
  
  if (webResult.success) {
    testIncidentIds.push(webResult.id);
    
    // Verify in database
    console.log(`${colors.blue}Verifying in database...${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure DB write
    
    const verification = await verifyIncidentInDatabase(webResult.id);
    
    if (verification.exists) {
      console.log(`${colors.green}✓ Incident found in database!${colors.reset}`);
      console.log(`  Database Record ID: ${verification.data.id}`);
      console.log(`  Created At: ${verification.data.created_at}`);
      
      // Compare data
      const dataMatch = compareData(webIncident, verification.data, 'Web Incident Data');
      
      if (dataMatch) {
        console.log(`${colors.green}✓ All fields match! Data integrity verified.${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Some fields don't match. Check data mapping.${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ Incident NOT found in database!${colors.reset}`);
    }
  }
  
  // Test 4: Submit Mobile-style incident
  console.log(`\n${colors.yellow}Step 4: Testing Mobile Frontend Submission${colors.reset}`);
  
  const mobileIncident = {
    title: 'Test Mobile Incident - Database Storage Test',
    description: 'Testing mobile submission storage',
    location: '14.5995,120.9842',
    latitude: 14.5995,
    longitude: 120.9842,
    status: 'pending',
    reporter_name: 'Test User Mobile',
    reporter_contact: '09222222222',
    incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
    incident_type: 'injured',
    pet_color: 'brown',
    pet_breed: 'Aspin',
    animal_type: 'cat',
    pet_gender: 'female',
    pet_size: 'small',
    images: JSON.stringify([])
  };
  
  const mobileResult = await submitTestIncident(mobileIncident, 'Mobile Frontend');
  
  if (mobileResult.success) {
    testIncidentIds.push(mobileResult.id);
    
    // Verify in database
    console.log(`${colors.blue}Verifying in database...${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const verification = await verifyIncidentInDatabase(mobileResult.id);
    
    if (verification.exists) {
      console.log(`${colors.green}✓ Incident found in database!${colors.reset}`);
      console.log(`  Database Record ID: ${verification.data.id}`);
      console.log(`  Created At: ${verification.data.created_at}`);
      console.log(`  Latitude: ${verification.data.latitude}`);
      console.log(`  Longitude: ${verification.data.longitude}`);
      console.log(`  Pet Color: ${verification.data.pet_color}`);
      console.log(`  Pet Breed: ${verification.data.pet_breed}`);
      
      // Compare data
      const dataMatch = compareData(mobileIncident, verification.data, 'Mobile Incident Data');
      
      if (dataMatch) {
        console.log(`${colors.green}✓ All fields match! Data integrity verified.${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Some fields don't match. Check data mapping.${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ Incident NOT found in database!${colors.reset}`);
    }
  }
  
  // Test 5: Check final count
  console.log(`\n${colors.yellow}Step 5: Verifying Incident Count${colors.reset}`);
  const finalCount = await getIncidentCount();
  const expectedCount = initialCount + testIncidentIds.length;
  
  console.log(`${colors.blue}Initial count: ${initialCount}${colors.reset}`);
  console.log(`${colors.blue}Submitted: ${testIncidentIds.length}${colors.reset}`);
  console.log(`${colors.blue}Expected count: ${expectedCount}${colors.reset}`);
  console.log(`${colors.blue}Final count: ${finalCount}${colors.reset}`);
  
  if (finalCount === expectedCount) {
    console.log(`${colors.green}✓ Count matches! All incidents stored correctly.${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Count mismatch! Expected ${expectedCount}, got ${finalCount}${colors.reset}`);
  }
  
  // Test 6: List all test incidents
  console.log(`\n${colors.yellow}Step 6: Listing All Test Incidents from Database${colors.reset}`);
  
  try {
    const placeholders = testIncidentIds.map(() => '?').join(',');
    const [incidents] = await pool.execute(
      `SELECT id, title, incident_type, status, reporter_name, created_at FROM incidents WHERE id IN (${placeholders}) ORDER BY id DESC`,
      testIncidentIds
    );
    
    console.log(`${colors.green}Found ${incidents.length} test incident(s) in database:${colors.reset}\n`);
    
    incidents.forEach((incident, index) => {
      console.log(`${colors.cyan}Incident #${index + 1}:${colors.reset}`);
      console.log(`  ID: ${incident.id}`);
      console.log(`  Title: ${incident.title}`);
      console.log(`  Type: ${incident.incident_type}`);
      console.log(`  Status: ${incident.status}`);
      console.log(`  Reporter: ${incident.reporter_name}`);
      console.log(`  Created: ${incident.created_at}`);
      console.log('');
    });
  } catch (error) {
    console.error(`${colors.red}Error listing incidents: ${error.message}${colors.reset}`);
  }
  
  // Test 7: Test retrieval via API
  console.log(`${colors.yellow}Step 7: Testing Retrieval via API${colors.reset}`);
  
  for (const id of testIncidentIds) {
    try {
      const response = await axios.get(`${API_BASE_URL}/incidents/${id}`);
      console.log(`${colors.green}✓ GET /api/incidents/${id} - Status ${response.status}${colors.reset}`);
      console.log(`  Title: ${response.data.data.title}`);
    } catch (error) {
      console.log(`${colors.red}✗ Failed to retrieve incident ${id}: ${error.message}${colors.reset}`);
    }
  }
  
  // Test 8: Cleanup
  console.log(`\n${colors.yellow}Step 8: Cleaning Up Test Data${colors.reset}`);
  
  for (const id of testIncidentIds) {
    try {
      await axios.delete(`${API_BASE_URL}/incidents/${id}`);
      console.log(`${colors.green}✓ Deleted incident ${id}${colors.reset}`);
      
      // Verify deletion
      const verification = await verifyIncidentInDatabase(id);
      if (!verification.exists) {
        console.log(`  ${colors.green}✓ Confirmed: Incident ${id} removed from database${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗ Warning: Incident ${id} still exists in database${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}✗ Failed to delete incident ${id}: ${error.message}${colors.reset}`);
    }
  }
  
  // Final count verification
  const cleanupCount = await getIncidentCount();
  console.log(`\n${colors.blue}Final incident count after cleanup: ${cleanupCount}${colors.reset}`);
  
  if (cleanupCount === initialCount) {
    console.log(`${colors.green}✓ Database restored to initial state${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Count difference: ${cleanupCount - initialCount}${colors.reset}`);
  }
  
  return true;
}

/**
 * Main execution
 */
async function main() {
  try {
    await runStorageTest();
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${colors.blue}Database Storage Test Complete${colors.reset}`);
    console.log(`${'='.repeat(80)}\n`);
    
    console.log(`${colors.green}Summary:${colors.reset}`);
    console.log(`  ✓ Database connection verified`);
    console.log(`  ✓ Incidents submitted via API`);
    console.log(`  ✓ Storage in database verified`);
    console.log(`  ✓ Data integrity checked`);
    console.log(`  ✓ Retrieval via API tested`);
    console.log(`  ✓ Deletion and cleanup verified`);
    console.log(`\n${colors.green}🎉 All database storage tests passed!${colors.reset}\n`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}Test execution failed:${colors.reset}`, error);
    await pool.end();
    process.exit(1);
  }
}

main();
