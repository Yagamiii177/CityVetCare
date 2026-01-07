/**
 * Quick Database Table Inspector
 * Shows the structure and sample data from incidents table
 */

import { pool } from './config/database.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
};

async function inspectIncidentsTable() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${colors.blue}Incidents Table Inspector${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);
  
  try {
    // Get table structure
    console.log(`${colors.yellow}Table Structure:${colors.reset}\n`);
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'incidents'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Column Name'.padEnd(25) + 'Type'.padEnd(20) + 'Nullable'.padEnd(12) + 'Default'.padEnd(15) + 'Key');
    console.log('-'.repeat(85));
    
    columns.forEach(col => {
      console.log(
        col.COLUMN_NAME.padEnd(25) +
        col.COLUMN_TYPE.padEnd(20) +
        col.IS_NULLABLE.padEnd(12) +
        (col.COLUMN_DEFAULT || 'NULL').toString().padEnd(15) +
        col.COLUMN_KEY
      );
    });
    
    // Get table count
    console.log(`\n${colors.yellow}Table Statistics:${colors.reset}\n`);
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM incidents');
    console.log(`Total records: ${countResult[0].total}`);
    
    // Get sample data if any
    if (countResult[0].total > 0) {
      console.log(`\n${colors.yellow}Sample Records (Last 5):${colors.reset}\n`);
      const [samples] = await pool.execute(`
        SELECT id, title, incident_type, animal_type, status, reporter_name, created_at
        FROM incidents
        ORDER BY id DESC
        LIMIT 5
      `);
      
      samples.forEach((record, index) => {
        console.log(`${colors.green}Record #${index + 1}:${colors.reset}`);
        console.log(`  ID: ${record.id}`);
        console.log(`  Title: ${record.title}`);
        console.log(`  Incident Type: ${record.incident_type || '(null)'}`);
        console.log(`  Animal Type: ${record.animal_type || '(null)'}`);
        console.log(`  Status: ${record.status}`);
        console.log(`  Reporter: ${record.reporter_name}`);
        console.log(`  Created: ${record.created_at}`);
        console.log('');
      });
    } else {
      console.log(`${colors.blue}No records in table.${colors.reset}`);
    }
    
    // Check for incident_type column specifics
    console.log(`\n${colors.yellow}Checking incident_type Column:${colors.reset}\n`);
    const incidentTypeCol = columns.find(col => col.COLUMN_NAME === 'incident_type');
    
    if (incidentTypeCol) {
      console.log(`${colors.green}✓ Column exists${colors.reset}`);
      console.log(`  Type: ${incidentTypeCol.COLUMN_TYPE}`);
      console.log(`  Nullable: ${incidentTypeCol.IS_NULLABLE}`);
      console.log(`  Default: ${incidentTypeCol.COLUMN_DEFAULT || 'NULL'}`);
      
      // If it's an ENUM, show the values
      if (incidentTypeCol.COLUMN_TYPE.startsWith('enum')) {
        const enumValues = incidentTypeCol.COLUMN_TYPE.match(/enum\((.*)\)/)[1];
        console.log(`  Allowed values: ${enumValues}`);
      }
    } else {
      console.log(`${colors.red}✗ Column does not exist!${colors.reset}`);
    }
    
    console.log(`\n${'='.repeat(80)}\n`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  
  await pool.end();
}

inspectIncidentsTable();
