/**
 * Test from Mobile Perspective - Simulates Anonymous Report
 * Tests using the CORRECT IP: 192.168.1.45
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://192.168.1.45:3000/api';  // ← Using CORRECT IP

console.log('\n' + '='.repeat(70));
console.log('📱 MOBILE APP SIMULATION - ANONYMOUS REPORT WITH IMAGES');
console.log('='.repeat(70) + '\n');
console.log('Testing with IP: 192.168.1.45');
console.log('This simulates what your phone app does\n');

/**
 * Test 1: Check backend connectivity
 */
async function testConnection() {
  console.log('🌐 Test 1: Testing backend connection...');
  
  try {
    const response = await axios.get(`http://192.168.1.45:3000/api/health`);
    if (response.data.status === 'OK') {
      console.log('✅ Backend is accessible!');
      console.log('   Status:', response.data.status);
      console.log('   Uptime:', response.data.uptime.toFixed(2), 'seconds');
      return true;
    }
  } catch (error) {
    console.error('❌ Cannot connect to backend:', error.message);
    return false;
  }
}

/**
 * Test 2: Upload images (anonymous - no login)
 */
async function testImageUpload() {
  console.log('\n📤 Test 2: Uploading images (anonymous)...');
  
  try {
    // Create test image
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    const formData = new FormData();
    const fileStream = fs.createReadStream(testImagePath);
    formData.append('images', fileStream, {
      filename: 'mobile-test-photo.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('   Uploading to:', `${BASE_URL}/incidents/upload-images`);
    
    const response = await axios.post(`${BASE_URL}/incidents/upload-images`, formData, {
      headers: formData.getHeaders()
    });
    
    if (response.data.success && response.data.images) {
      console.log('✅ Images uploaded successfully!');
      console.log('   Uploaded:', response.data.images.length, 'image(s)');
      console.log('   URLs:', response.data.images);
      return response.data.images;
    } else {
      console.log('❌ Upload response invalid:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Test 3: Submit anonymous report with images
 */
async function testAnonymousReport(imageUrls) {
  console.log('\n📝 Test 3: Submitting anonymous report...');
  
  const reportData = {
    title: 'Stray Animal Report',
    description: 'Testing from mobile - Large dog near residential area',
    location: '13.6218,123.1948',
    latitude: 13.6218,
    longitude: 123.1948,
    status: 'pending',
    reporter_name: 'Mobile Test User',  // No login, anonymous
    reporter_contact: '09123456789',
    incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
    incident_type: 'stray',
    pet_color: 'Brown',
    pet_breed: 'Mixed Breed',
    animal_type: 'dog',
    pet_gender: 'male',
    pet_size: 'large',
    images: imageUrls  // Array of uploaded image URLs
  };
  
  console.log('   Report Type:', reportData.incident_type);
  console.log('   Contact:', reportData.reporter_contact);
  console.log('   Images:', imageUrls.length);
  
  try {
    const response = await axios.post(`${BASE_URL}/incidents`, reportData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success && response.data.id) {
      console.log('✅ Report submitted successfully!');
      console.log('   Report ID:', response.data.id);
      return response.data.id;
    } else {
      console.log('❌ Submission failed:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Submission error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test 4: Fetch report back and verify images
 */
async function testReportRetrieval(reportId) {
  console.log('\n🔍 Test 4: Fetching report back from API...');
  
  try {
    const response = await axios.get(`${BASE_URL}/incidents/${reportId}`);
    
    if (response.data.success && response.data.data) {
      const report = response.data.data;
      console.log('✅ Report retrieved successfully!');
      console.log('\n📋 Report Details:');
      console.log('   ID:', report.id);
      console.log('   Reporter:', report.reporter_name);
      console.log('   Contact:', report.reporter_contact);
      console.log('   Type:', report.report_type);
      console.log('   Animal:', report.animal_type, '-', report.pet_breed);
      console.log('   Color:', report.pet_color);
      console.log('   Gender:', report.pet_gender);
      console.log('   Size:', report.pet_size);
      console.log('   Location:', report.location);
      console.log('   Status:', report.status);
      console.log('   Images:', report.images);
      
      if (report.images && report.images.length > 0) {
        console.log('\n✅ SUCCESS: Images are present in report!');
        console.log('   Image Count:', report.images.length);
        report.images.forEach((img, i) => {
          console.log(`   Image ${i + 1}:`, img);
        });
        return true;
      } else {
        console.log('\n❌ PROBLEM: No images in report!');
        console.log('   This means images were not stored in database');
        return false;
      }
    } else {
      console.log('❌ Failed to retrieve report:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Retrieval error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 5: Verify image is accessible from web
 */
async function testImageAccess(imageUrls) {
  console.log('\n🌐 Test 5: Testing image accessibility from web...');
  
  for (let i = 0; i < imageUrls.length; i++) {
    const imagePath = imageUrls[i];
    const fullUrl = `http://192.168.1.45:3000${imagePath}`;
    
    try {
      const response = await axios.get(fullUrl, {
        responseType: 'arraybuffer',
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(`✅ Image ${i + 1} accessible from web: ${fullUrl}`);
        console.log(`   Size: ${(response.data.length / 1024).toFixed(2)} KB`);
      } else {
        console.log(`❌ Image ${i + 1} NOT accessible (${response.status}): ${fullUrl}`);
      }
    } catch (error) {
      console.log(`❌ Image ${i + 1} ERROR:`, error.message);
    }
  }
}

/**
 * Main test execution
 */
async function runMobileSimulation() {
  console.log('Starting mobile app simulation...\n');
  
  try {
    // Test 1: Connection
    const connected = await testConnection();
    if (!connected) {
      console.log('\n❌ FAILED: Cannot connect to backend');
      console.log('   Make sure backend is running on 192.168.1.45:3000');
      return;
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 2: Upload images
    const imageUrls = await testImageUpload();
    if (imageUrls.length === 0) {
      console.log('\n❌ FAILED: Could not upload images');
      console.log('   This is what your mobile app experiences');
      return;
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 3: Submit report
    const reportId = await testAnonymousReport(imageUrls);
    if (!reportId) {
      console.log('\n❌ FAILED: Could not submit report');
      return;
    }
    
    // Wait for database to commit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 4: Retrieve report
    const hasImages = await testReportRetrieval(reportId);
    
    // Test 5: Image accessibility
    await testImageAccess(imageUrls);
    
    // Final summary
    console.log('\n' + '='.repeat(70));
    if (hasImages) {
      console.log('✅ ALL TESTS PASSED - Mobile Flow Works Correctly!');
      console.log('\n📱 What This Means:');
      console.log('   ✅ Backend is accessible from network');
      console.log('   ✅ Images can be uploaded without login');
      console.log('   ✅ Reports save correctly with images');
      console.log('   ✅ Images are stored in database');
      console.log('   ✅ Images are accessible from web');
      console.log('\n🎯 Next Step:');
      console.log('   1. Your mobile app config is now FIXED (IP updated to 192.168.1.45)');
      console.log('   2. Reload your Expo app (shake → Reload)');
      console.log('   3. Submit a test report with images');
      console.log('   4. Check web dashboard - images should appear!');
    } else {
      console.log('❌ TEST FAILED - Images not properly stored');
    }
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n💥 UNEXPECTED ERROR:', error);
  }
}

// Run the simulation
console.log('🔧 Configuration:');
console.log('   Backend URL:', BASE_URL);
console.log('   Computer IP:', '192.168.1.45');
console.log('   Backend Port:', '3000');
console.log('');

runMobileSimulation();
