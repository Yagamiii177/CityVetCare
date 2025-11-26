/**
 * API Testing Script
 * Test all API endpoints for AllIncidentReport component
 */

import { apiService } from '../utils/api';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

/**
 * Test: Fetch All Incidents
 */
export const testGetAllIncidents = async () => {
  try {
    log.info('Testing: GET all incidents...');
    const response = await apiService.incidents.getAll();
    
    if (response.data && response.data.records) {
      log.success(`Fetched ${response.data.total} incidents`);
      return { success: true, data: response.data };
    } else {
      log.error('No records found in response');
      return { success: false, error: 'Invalid response format' };
    }
  } catch (error) {
    log.error(`Failed to fetch incidents: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Test: Fetch Single Incident
 */
export const testGetIncidentById = async (id = 1) => {
  try {
    log.info(`Testing: GET incident by ID (${id})...`);
    const response = await apiService.incidents.getById(id);
    
    if (response.data && response.data.id) {
      log.success(`Fetched incident #${response.data.id}: ${response.data.title}`);
      return { success: true, data: response.data };
    } else {
      log.error('Incident not found');
      return { success: false, error: 'Incident not found' };
    }
  } catch (error) {
    log.error(`Failed to fetch incident: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Test: Create New Incident
 */
export const testCreateIncident = async () => {
  try {
    log.info('Testing: POST create new incident...');
    
    const testIncident = {
      title: 'Test Incident - Automated',
      description: 'This is a test incident created by automated testing',
      location: 'Test Location, Barangay Testing',
      status: 'pending',
      priority: 'medium',
      reporter_name: 'Test Reporter',
      reporter_contact: '09123456789',
      incident_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    
    const response = await apiService.incidents.create(testIncident);
    
    if (response.data && response.data.message === 'Incident created successfully') {
      log.success(`Created incident #${response.data.id}`);
      return { success: true, data: response.data, id: response.data.id };
    } else {
      log.error('Failed to create incident');
      return { success: false, error: 'Creation failed' };
    }
  } catch (error) {
    log.error(`Failed to create incident: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Test: Update Incident
 */
export const testUpdateIncident = async (id) => {
  try {
    log.info(`Testing: PUT update incident #${id}...`);
    
    const updateData = {
      id,
      title: 'Updated Test Incident',
      description: 'This incident has been updated by automated testing',
      location: 'Updated Location',
      status: 'verified',
      priority: 'high',
    };
    
    const response = await apiService.incidents.update(id, updateData);
    
    if (response.data && response.data.message === 'Incident updated successfully') {
      log.success(`Updated incident #${id}`);
      return { success: true, data: response.data };
    } else {
      log.error('Failed to update incident');
      return { success: false, error: 'Update failed' };
    }
  } catch (error) {
    log.error(`Failed to update incident: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Test: Delete Incident
 */
export const testDeleteIncident = async (id) => {
  try {
    log.info(`Testing: DELETE incident #${id}...`);
    const response = await apiService.incidents.delete(id);
    
    if (response.data && response.data.message === 'Incident deleted successfully') {
      log.success(`Deleted incident #${id}`);
      return { success: true, data: response.data };
    } else {
      log.error('Failed to delete incident');
      return { success: false, error: 'Deletion failed' };
    }
  } catch (error) {
    log.error(`Failed to delete incident: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Test: Filter Incidents by Status
 */
export const testFilterByStatus = async (status = 'pending') => {
  try {
    log.info(`Testing: GET incidents filtered by status (${status})...`);
    const response = await apiService.incidents.getAll({ status });
    
    if (response.data && response.data.records) {
      const filteredCount = response.data.records.filter(r => r.status === status).length;
      log.success(`Found ${filteredCount} incidents with status: ${status}`);
      return { success: true, data: response.data };
    } else {
      log.error('Failed to filter incidents');
      return { success: false, error: 'Filter failed' };
    }
  } catch (error) {
    log.error(`Failed to filter incidents: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Test: Search Incidents
 */
export const testSearchIncidents = async (searchTerm = 'dog') => {
  try {
    log.info(`Testing: GET incidents with search (${searchTerm})...`);
    const response = await apiService.incidents.getAll({ search: searchTerm });
    
    if (response.data && response.data.records) {
      log.success(`Search returned ${response.data.total} results`);
      return { success: true, data: response.data };
    } else {
      log.error('Search failed');
      return { success: false, error: 'Search failed' };
    }
  } catch (error) {
    log.error(`Failed to search incidents: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Run All Tests
 */
export const runAllTests = async () => {
  console.log('\n=================================');
  console.log('🧪 API Testing Suite');
  console.log('=================================\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };
  
  // Test 1: Get All Incidents
  const test1 = await testGetAllIncidents();
  results.tests.push({ name: 'Get All Incidents', result: test1 });
  test1.success ? results.passed++ : results.failed++;
  
  // Test 2: Get Single Incident
  const test2 = await testGetIncidentById(1);
  results.tests.push({ name: 'Get Incident by ID', result: test2 });
  test2.success ? results.passed++ : results.failed++;
  
  // Test 3: Create Incident
  const test3 = await testCreateIncident();
  results.tests.push({ name: 'Create Incident', result: test3 });
  test3.success ? results.passed++ : results.failed++;
  
  let createdId = test3.id;
  
  // Test 4: Update Incident (if created)
  if (createdId) {
    const test4 = await testUpdateIncident(createdId);
    results.tests.push({ name: 'Update Incident', result: test4 });
    test4.success ? results.passed++ : results.failed++;
  }
  
  // Test 5: Filter by Status
  const test5 = await testFilterByStatus('pending');
  results.tests.push({ name: 'Filter by Status', result: test5 });
  test5.success ? results.passed++ : results.failed++;
  
  // Test 6: Search
  const test6 = await testSearchIncidents('dog');
  results.tests.push({ name: 'Search Incidents', result: test6 });
  test6.success ? results.passed++ : results.failed++;
  
  // Test 7: Delete Incident (if created)
  if (createdId) {
    const test7 = await testDeleteIncident(createdId);
    results.tests.push({ name: 'Delete Incident', result: test7 });
    test7.success ? results.passed++ : results.failed++;
  }
  
  // Summary
  console.log('\n=================================');
  console.log('📊 Test Summary');
  console.log('=================================');
  console.log(`Total Tests: ${results.tests.length}`);
  log.success(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    log.error(`Failed: ${results.failed}`);
  }
  console.log('=================================\n');
  
  return results;
};

// Export for use in console
if (typeof window !== 'undefined') {
  window.apiTests = {
    runAll: runAllTests,
    getAll: testGetAllIncidents,
    getById: testGetIncidentById,
    create: testCreateIncident,
    update: testUpdateIncident,
    delete: testDeleteIncident,
    filter: testFilterByStatus,
    search: testSearchIncidents,
  };
  
  console.log('API Tests loaded! Run: window.apiTests.runAll()');
}
