import fetch from 'node-fetch';
import mysql from 'mysql2/promise';

const API_URL = 'http://localhost:3000';

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cityvetcare_db'
};

async function testReportSubmission() {
  console.log('🧪 Testing Report Submission...\n');
  
  // Test data matching web and mobile form fields
  const testReport = {
    incident_type: 'stray',
    animal_type: 'dog',
    pet_gender: 'male',
    pet_size: 'medium',
    pet_breed: 'Aspin',
    pet_color: 'brown',
    reporter_contact: '09123456789',
    incident_date: new Date().toISOString(),
    description: 'Found a stray dog near the park',
    latitude: 14.5995,
    longitude: 120.9842,
    images: ['test-image1.jpg', 'test-image2.jpg']
  };

  try {
    // Step 1: Submit the report
    console.log('📤 Submitting report...');
    console.log('Data:', JSON.stringify(testReport, null, 2));
    
    const response = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testReport)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log('✅ Report submitted successfully!');
    console.log('Response:', JSON.stringify(result, null, 2));

    // Step 2: Verify in database
    console.log('\n📊 Verifying in database...');
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        ir.report_id,
        ir.report_type,
        ir.description,
        ir.incident_date,
        ir.status,
        ir.reported_at,
        r.contact_number as reporter_contact,
        l.latitude,
        l.longitude,
        p.animal_type,
        p.pet_color,
        p.pet_breed,
        p.pet_gender,
        p.pet_size
      FROM incident_report ir
      JOIN reporter r ON ir.reporter_id = r.reporter_id
      JOIN incident_location l ON ir.location_id = l.location_id
      LEFT JOIN incident_pet p ON ir.report_id = p.report_id
      ORDER BY ir.report_id DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      console.log('❌ No data found in database!');
      await connection.end();
      return;
    }

    const savedReport = rows[0];
    
    // Get images
    const [images] = await connection.execute(
      'SELECT image_path FROM report_image WHERE report_id = ?',
      [savedReport.report_id]
    );

    console.log('\n✅ Report found in database!');
    console.log('Report ID:', savedReport.report_id);
    console.log('Report Type:', savedReport.report_type);
    console.log('Animal Type:', savedReport.animal_type);
    console.log('Pet Gender:', savedReport.pet_gender);
    console.log('Pet Size:', savedReport.pet_size);
    console.log('Pet Breed:', savedReport.pet_breed);
    console.log('Pet Color:', savedReport.pet_color);
    console.log('Reporter Contact:', savedReport.reporter_contact);
    console.log('Description:', savedReport.description);
    console.log('Latitude:', savedReport.latitude);
    console.log('Longitude:', savedReport.longitude);
    console.log('Images:', images.map(img => img.image_path));
    console.log('Incident Date:', savedReport.incident_date);
    console.log('Status:', savedReport.status);
    console.log('Reported At:', savedReport.reported_at);

    // Step 3: Verify all fields match
    console.log('\n🔍 Field Verification:');
    const checks = [
      ['report_type', testReport.incident_type, savedReport.report_type],
      ['animal_type', testReport.animal_type === 'dog' ? 'Dog' : testReport.animal_type, savedReport.animal_type],
      ['pet_gender', testReport.pet_gender.charAt(0).toUpperCase() + testReport.pet_gender.slice(1), savedReport.pet_gender],
      ['pet_size', testReport.pet_size.charAt(0).toUpperCase() + testReport.pet_size.slice(1), savedReport.pet_size],
      ['pet_breed', testReport.pet_breed, savedReport.pet_breed],
      ['pet_color', testReport.pet_color, savedReport.pet_color],
      ['reporter_contact', testReport.reporter_contact, savedReport.reporter_contact],
      ['description', testReport.description, savedReport.description],
      ['latitude', parseFloat(testReport.latitude), parseFloat(savedReport.latitude)],
      ['longitude', parseFloat(testReport.longitude), parseFloat(savedReport.longitude)],
      ['images_count', testReport.images.length, images.length]
    ];

    let allMatch = true;
    checks.forEach(([field, expected, actual]) => {
      const match = expected == actual;
      console.log(`  ${match ? '✅' : '❌'} ${field}: ${match ? 'Match' : `Expected "${expected}", got "${actual}"`}`);
      if (!match) allMatch = false;
    });

    await connection.end();

    if (allMatch) {
      console.log('\n🎉 All fields verified successfully!');
      console.log('✅ Web and mobile forms will work correctly with this schema.');
    } else {
      console.log('\n⚠️  Some fields did not match. Check backend mapping.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testReportSubmission();
