import mysql from 'mysql2/promise';

async function addTestIncidentData() {
  console.log('🔧 Adding test incident data to database...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cityvetcare_db'
  });

  try {
    // Sample incident data
    const testIncidents = [
      {
        title: 'Injured Dog on Main Street',
        description: 'A large dog appears to be injured and limping on Main Street near the park. The dog seems aggressive when approached.',
        location: 'Main Street, near Central Park',
        latitude: 14.5995,
        longitude: 120.9842,
        status: 'pending',
        incident_type: 'incident',
        animal_type: 'dog',
        pet_breed: 'German Shepherd',
        pet_color: 'Brown and Black',
        pet_gender: 'male',
        pet_size: 'large',
        reporter_name: 'John Smith',
        reporter_contact: '09171234567',
        reporter_address: '123 Main Street',
        incident_date: new Date()
      },
      {
        title: 'Stray Cat Colony Behind Market',
        description: 'Multiple stray cats found behind the public market. They appear malnourished and need assistance.',
        location: 'Behind Public Market, Commercial District',
        latitude: 14.6042,
        longitude: 120.9822,
        status: 'verified',
        incident_type: 'stray',
        animal_type: 'cat',
        pet_breed: 'Mixed breed',
        pet_color: 'Various colors',
        pet_gender: 'unknown',
        pet_size: 'small',
        reporter_name: 'Maria Santos',
        reporter_contact: '09181234568',
        reporter_address: '456 Market Avenue',
        incident_date: new Date(Date.now() - 86400000) // Yesterday
      },
      {
        title: 'Lost Golden Retriever',
        description: 'Lost golden retriever, very friendly, answers to "Buddy". Last seen in residential area wearing a blue collar.',
        location: 'Residential Area, Sunset Boulevard',
        latitude: 14.6010,
        longitude: 120.9900,
        status: 'in_progress',
        incident_type: 'lost',
        animal_type: 'dog',
        pet_breed: 'Golden Retriever',
        pet_color: 'Golden',
        pet_gender: 'male',
        pet_size: 'large',
        reporter_name: 'Sarah Johnson',
        reporter_contact: '09191234569',
        reporter_address: '789 Sunset Boulevard',
        incident_date: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        title: 'Aggressive Stray Dog Near School',
        description: 'A stray dog showing aggressive behavior near elementary school. Students are afraid to pass the area.',
        location: 'Near Elementary School, Education Avenue',
        latitude: 14.5980,
        longitude: 120.9880,
        status: 'assigned',
        incident_type: 'stray',
        animal_type: 'dog',
        pet_breed: 'Aspin',
        pet_color: 'Brown',
        pet_gender: 'female',
        pet_size: 'medium',
        reporter_name: 'Teacher Rodriguez',
        reporter_contact: '09201234570',
        reporter_address: 'Elementary School Office',
        assigned_staff_name: 'Catcher Team Alpha',
        incident_date: new Date(Date.now() - 43200000) // 12 hours ago
      },
      {
        title: 'Injured Cat in Parking Lot',
        description: 'Small cat found injured in parking lot. Appears to have been hit by a vehicle. Needs immediate medical attention.',
        location: 'Shopping Mall Parking Lot, Commercial Complex',
        latitude: 14.6020,
        longitude: 120.9850,
        status: 'scheduled',
        incident_type: 'incident',
        animal_type: 'cat',
        pet_breed: 'Persian',
        pet_color: 'White',
        pet_gender: 'female',
        pet_size: 'small',
        reporter_name: 'Mike Chen',
        reporter_contact: '09211234571',
        reporter_address: '321 Shopping Street',
        assigned_staff_name: 'Catcher Team Beta',
        incident_date: new Date(Date.now() - 7200000) // 2 hours ago
      }
    ];

    // Insert incidents
    for (const incident of testIncidents) {
      const query = `
        INSERT INTO incidents (
          title, description, location, latitude, longitude, 
          status, incident_type, animal_type, pet_breed, pet_color, 
          pet_gender, pet_size, reporter_name, reporter_contact, 
          reporter_address, assigned_staff_name, incident_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        incident.title,
        incident.description,
        incident.location,
        incident.latitude,
        incident.longitude,
        incident.status,
        incident.incident_type,
        incident.animal_type,
        incident.pet_breed,
        incident.pet_color,
        incident.pet_gender,
        incident.pet_size,
        incident.reporter_name,
        incident.reporter_contact,
        incident.reporter_address,
        incident.assigned_staff_name || null,
        incident.incident_date
      ];
      
      await connection.query(query, values);
      console.log(`✅ Added: ${incident.title}`);
    }
    
    // Show total count
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM incidents');
    console.log(`\n📊 Total incidents in database: ${rows[0].count}`);
    
    // Show summary by status
    const [statusRows] = await connection.query(`
      SELECT status, COUNT(*) as count 
      FROM incidents 
      GROUP BY status
    `);
    
    console.log('\n📈 Incidents by status:');
    statusRows.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });
    
    console.log('\n✅ Test data added successfully!\n');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addTestIncidentData();
