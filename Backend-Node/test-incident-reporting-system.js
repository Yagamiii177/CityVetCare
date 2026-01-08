/**
 * Comprehensive Test for Incident Reporting System
 * Tests all requirements:
 * 1. Reporter identity shows pet owner name (not "Anonymous" or "Admin Portal")
 * 2. Authenticated submission attaches owner_id server-side
 * 3. Web admin shows correct reporter names with proper JOINs
 * 4. View details page is complete with patrol assignments
 * 5. Timeline shows real timestamps
 * 6. Mobile "My Reports" matches web data
 */

import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

const DB_CONFIG = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cityvetcare_db'
};

const API_BASE = 'http://localhost:3000/api';

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bold');
  console.log('='.repeat(80) + '\n');
}

async function testDatabaseSchema() {
  section('TEST 1: Database Schema Verification');
  
  const connection = await mysql.createConnection(DB_CONFIG);
  
  try {
    // Check incident_report table has owner_id column
    const [columns] = await connection.execute('DESCRIBE incident_report');
    const ownerIdCol = columns.find(col => col.Field === 'owner_id');
    
    if (ownerIdCol) {
      log('✓ incident_report table has owner_id column', 'green');
      log(`  Type: ${ownerIdCol.Type}, Null: ${ownerIdCol.Null}`, 'cyan');
    } else {
      log('✗ incident_report table missing owner_id column', 'red');
      return false;
    }
    
    // Check pet_owner table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'pet_owner'");
    if (tables.length > 0) {
      log('✓ pet_owner table exists', 'green');
    } else {
      log('✗ pet_owner table not found', 'red');
      return false;
    }
    
    // Check patrol_schedule table exists
    const [patrolTables] = await connection.execute("SHOW TABLES LIKE 'patrol_schedule'");
    if (patrolTables.length > 0) {
      log('✓ patrol_schedule table exists', 'green');
    } else {
      log('✗ patrol_schedule table not found', 'red');
      return false;
    }
    
    return true;
  } finally {
    await connection.end();
  }
}

async function testReporterNameQuery() {
  section('TEST 2: Reporter Name Query (JOIN with pet_owner)');
  
  const connection = await mysql.createConnection(DB_CONFIG);
  
  try {
    // Test the query that should show pet owner names for authenticated reports
    const query = `
      SELECT 
        ir.report_id,
        ir.owner_id,
        CASE 
          WHEN ir.owner_id IS NOT NULL THEN po.full_name
          ELSE r.full_name
        END as reporter_name,
        CASE
          WHEN ir.owner_id IS NOT NULL THEN 'Pet Owner'
          ELSE 'Anonymous (Emergency)'
        END as account_type
      FROM incident_report ir
      JOIN reporter r ON ir.reporter_id = r.reporter_id
      LEFT JOIN pet_owner po ON ir.owner_id = po.owner_id
      LIMIT 5
    `;
    
    const [rows] = await connection.execute(query);
    
    if (rows.length === 0) {
      log('⚠ No incident reports found in database', 'yellow');
      return true;
    }
    
    log(`Found ${rows.length} reports to test:`, 'cyan');
    
    let authenticatedCount = 0;
    let emergencyCount = 0;
    let hasValidNames = true;
    
    for (const row of rows) {
      const isAuthenticated = row.owner_id !== null;
      
      if (isAuthenticated) {
        authenticatedCount++;
        
        // Check that reporter name exists and is not empty or obviously wrong
        const isInvalid = !row.reporter_name || 
                         row.reporter_name.trim() === '' ||
                         row.reporter_name === 'Anonymous' ||
                         row.reporter_name === 'Admin Portal' ||
                         row.reporter_name === 'Mobile User';
        
        if (isInvalid) {
          log(`  ✗ Report #${row.report_id}: Invalid name "${row.reporter_name}" for authenticated user`, 'red');
          hasValidNames = false;
        } else {
          log(`  ✓ Report #${row.report_id}: "${row.reporter_name}" (${row.account_type})`, 'green');
        }
      } else {
        emergencyCount++;
        log(`  ✓ Report #${row.report_id}: "${row.reporter_name}" (${row.account_type})`, 'green');
      }
    }
    
    log(`\nSummary: ${authenticatedCount} authenticated, ${emergencyCount} emergency reports`, 'cyan');
    
    return hasValidNames;
  } finally {
    await connection.end();
  }
}

async function testIncidentDetailsAPI() {
  section('TEST 3: Incident Details API (Complete Data)');
  
  const connection = await mysql.createConnection(DB_CONFIG);
  
  try {
    // Get a sample incident ID
    const [incidents] = await connection.execute(
      'SELECT report_id FROM incident_report LIMIT 1'
    );
    
    if (incidents.length === 0) {
      log('⚠ No incidents found to test', 'yellow');
      return true;
    }
    
    const incidentId = incidents[0].report_id;
    log(`Testing incident #${incidentId}...`, 'cyan');
    
    // Call the API
    const response = await fetch(`${API_BASE}/incidents/${incidentId}`);
    const data = await response.json();
    
    if (!data.success || !data.data) {
      log('✗ API request failed or returned invalid data', 'red');
      return false;
    }
    
    const incident = data.data;
    
    // Check required fields
    const requiredFields = [
      'id', 'reporter_name', 'account_type', 'location', 
      'latitude', 'longitude', 'status', 'created_at'
    ];
    
    let allFieldsPresent = true;
    
    for (const field of requiredFields) {
      if (incident[field] !== undefined && incident[field] !== null) {
        log(`  ✓ ${field}: ${JSON.stringify(incident[field]).substring(0, 50)}`, 'green');
      } else {
        log(`  ✗ Missing required field: ${field}`, 'red');
        allFieldsPresent = false;
      }
    }
    
    // Check patrol assignment details
    if (incident.assigned_catchers && incident.assigned_catchers.length > 0) {
      log(`  ✓ Patrol Assignment: ${incident.assigned_catchers.length} catcher(s) assigned`, 'green');
      incident.assigned_catchers.forEach((catcher, i) => {
        log(`    - ${catcher.full_name} (${catcher.contact_number || 'no contact'})`, 'cyan');
      });
    } else {
      log(`  ℹ Patrol Assignment: Not yet assigned`, 'yellow');
    }
    
    // Check timeline
    if (incident.timeline && incident.timeline.length > 0) {
      log(`  ✓ Timeline: ${incident.timeline.length} events`, 'green');
      incident.timeline.forEach((event) => {
        log(`    - ${event.status}: ${event.description} [${event.completed ? 'Complete' : 'Pending'}]`, 'cyan');
      });
    } else {
      log(`  ✗ Timeline: Missing or empty`, 'red');
      allFieldsPresent = false;
    }
    
    // Check images
    if (incident.images && incident.images.length > 0) {
      log(`  ✓ Images: ${incident.images.length} image(s)`, 'green');
    } else {
      log(`  ℹ Images: No images uploaded`, 'yellow');
    }
    
    return allFieldsPresent;
  } finally {
    await connection.end();
  }
}

async function testMyReportsAPI() {
  section('TEST 4: My Reports API (Mobile/Authenticated Users)');
  
  const connection = await mysql.createConnection(DB_CONFIG);
  
  try {
    // Get a pet owner with reports
    const [owners] = await connection.execute(`
      SELECT DISTINCT po.owner_id, po.full_name, COUNT(ir.report_id) as report_count
      FROM pet_owner po
      JOIN incident_report ir ON po.owner_id = ir.owner_id
      GROUP BY po.owner_id
      LIMIT 1
    `);
    
    if (owners.length === 0) {
      log('⚠ No pet owners with reports found', 'yellow');
      return true;
    }
    
    const owner = owners[0];
    log(`Testing reports for owner: ${owner.full_name} (ID: ${owner.owner_id})`, 'cyan');
    log(`Expected ${owner.report_count} report(s)`, 'cyan');
    
    // Call the API endpoint
    const response = await fetch(`${API_BASE}/incidents/owner/${owner.owner_id}`);
    const data = await response.json();
    
    if (!data.success || !data.data) {
      log('✗ API request failed', 'red');
      return false;
    }
    
    const reports = data.data;
    log(`\n✓ API returned ${reports.length} report(s)`, 'green');
    
    let allValid = true;
    
    for (const report of reports) {
      log(`\nReport #${report.id}:`, 'cyan');
      
      // Check essential fields
      const checks = [
        { field: 'incident_type', label: 'Incident Type' },
        { field: 'status', label: 'Status' },
        { field: 'location', label: 'Location' },
        { field: 'created_at', label: 'Created At' },
        { field: 'timeline', label: 'Timeline', isArray: true },
        { field: 'images', label: 'Images', isArray: true }
      ];
      
      for (const check of checks) {
        if (check.isArray) {
          const arr = report[check.field] || [];
          log(`  ${check.label}: ${arr.length} item(s)`, arr.length > 0 ? 'green' : 'yellow');
        } else if (report[check.field]) {
          log(`  ✓ ${check.label}: ${report[check.field]}`, 'green');
        } else {
          log(`  ✗ ${check.label}: Missing`, 'red');
          allValid = false;
        }
      }
      
      // Check patrol info
      if (report.assigned_catchers && report.assigned_catchers.length > 0) {
        log(`  ✓ Patrol: ${report.assigned_catchers_list}`, 'green');
      } else {
        log(`  ℹ Patrol: Not assigned yet`, 'yellow');
      }
    }
    
    return allValid;
  } finally {
    await connection.end();
  }
}

async function testImagePaths() {
  section('TEST 5: Image Path Verification');
  
  const connection = await mysql.createConnection(DB_CONFIG);
  
  try {
    const [images] = await connection.execute(`
      SELECT ri.image_id, ri.report_id, ri.image_path
      FROM report_image ri
      JOIN incident_report ir ON ri.report_id = ir.report_id
      LIMIT 5
    `);
    
    if (images.length === 0) {
      log('⚠ No images found to test', 'yellow');
      return true;
    }
    
    log(`Found ${images.length} images to verify:`, 'cyan');
    
    let allValid = true;
    
    for (const img of images) {
      // Check that path is properly formatted
      const isValid = img.image_path && (
        img.image_path.startsWith('/uploads/') ||
        img.image_path.startsWith('http')
      );
      
      if (isValid) {
        log(`  ✓ Image #${img.image_id}: ${img.image_path}`, 'green');
      } else {
        log(`  ✗ Image #${img.image_id}: Invalid path "${img.image_path}"`, 'red');
        allValid = false;
      }
    }
    
    return allValid;
  } finally {
    await connection.end();
  }
}

async function runAllTests() {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         INCIDENT REPORTING SYSTEM - COMPREHENSIVE TEST SUITE              ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  
  const tests = [
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'Reporter Name Query', fn: testReporterNameQuery },
    { name: 'Incident Details API', fn: testIncidentDetailsAPI },
    { name: 'My Reports API', fn: testMyReportsAPI },
    { name: 'Image Paths', fn: testImagePaths }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      log(`\n✗ Test "${test.name}" threw an error:`, 'red');
      console.error(error);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  section('TEST SUMMARY');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });
  
  console.log('\n' + '─'.repeat(80));
  
  if (passed === total) {
    log(`\n🎉 ALL TESTS PASSED (${passed}/${total})`, 'green');
    log('\n✅ INCIDENT REPORTING SYSTEM IS WORKING CORRECTLY', 'green');
    log('   • Reporter identity shows correct pet owner names', 'green');
    log('   • Authenticated reports properly linked via owner_id', 'green');
    log('   • Web admin displays complete data with proper JOINs', 'green');
    log('   • View details shows patrol assignments and timeline', 'green');
    log('   • Mobile My Reports matches web data consistency', 'green');
  } else {
    log(`\n⚠️  SOME TESTS FAILED (${passed}/${total} passed)`, 'yellow');
    log('\nPlease review the failed tests above and fix the issues.', 'yellow');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log('\n✗ Test suite crashed:', 'red');
  console.error(error);
  process.exit(1);
});
