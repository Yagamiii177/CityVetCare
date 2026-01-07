import pool from './config/database.js';

async function test() {
  try {
    console.log('Testing SQL query...\n');
    
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN \`status\` = 'Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN \`status\` = 'Verified' THEN 1 END) as verified,
        COUNT(CASE WHEN \`status\` = 'In Progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN \`status\` = 'Resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN \`status\` = 'Rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN \`status\` = 'Scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN report_type = 'bite' THEN 1 END) as bite_incidents,
        COUNT(CASE WHEN report_type = 'stray' THEN 1 END) as stray_incidents,
        COUNT(CASE WHEN report_type = 'lost' THEN 1 END) as lost_incidents,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as \`high_priority\`
      FROM incident_report
    `;
    
    console.log('Query:', query);
    
    const [rows] = await pool.execute(query);
    
    console.log('\nResults:', rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('SQL Error Code:', error.code);
    console.error('SQL State:', error.sqlState);
    process.exit(1);
  }
}

test();
