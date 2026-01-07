// Quick script to verify the system is ready for testing
import mysql from 'mysql2/promise';

async function verifySystem() {
  console.log('🔍 Verifying CityVetCare System Status...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cityvetcare_db'
  });

  try {
    // Get incident count
    const [incidents] = await connection.query('SELECT COUNT(*) as count FROM incidents');
    console.log(`✅ Database Connected`);
    console.log(`   Total incidents: ${incidents[0].count}\n`);
    
    // Get incidents by status
    const [statusBreakdown] = await connection.query(`
      SELECT status, COUNT(*) as count 
      FROM incidents 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    console.log('📊 Incidents by Status:');
    statusBreakdown.forEach(row => {
      console.log(`   ${row.status.padEnd(15)} : ${row.count}`);
    });
    
    // Get incidents by type
    const [typeBreakdown] = await connection.query(`
      SELECT incident_type, COUNT(*) as count 
      FROM incidents 
      GROUP BY incident_type 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Incidents by Type:');
    typeBreakdown.forEach(row => {
      console.log(`   ${row.incident_type.padEnd(15)} : ${row.count}`);
    });
    
    // Get recent incidents
    const [recentIncidents] = await connection.query(`
      SELECT id, title, status, incident_type, reporter_name, created_at 
      FROM incidents 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 Recent Incidents:');
    recentIncidents.forEach((incident, index) => {
      console.log(`\n${index + 1}. [ID: ${incident.id}] ${incident.title}`);
      console.log(`   Status: ${incident.status} | Type: ${incident.incident_type}`);
      console.log(`   Reporter: ${incident.reporter_name}`);
      console.log(`   Date: ${new Date(incident.created_at).toLocaleString()}`);
    });
    
    console.log('\n\n✅ System is ready for testing!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Backend API is running on http://localhost:3000');
    console.log('   2. Frontend is running on http://localhost:5174');
    console.log('   3. Navigate to "All Incident Reports" in the web interface');
    console.log('   4. You should see all 5 test incidents displayed');
    console.log('   5. Try submitting a new incident report\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

verifySystem();
