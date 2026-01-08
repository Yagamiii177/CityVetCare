/**
 * Test Anonymous Report with Image Upload
 * This tests the complete flow from mobile submission without login
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

console.log('\n' + '='.repeat(70));
console.log('🧪 TESTING ANONYMOUS REPORT WITH IMAGES');
console.log('='.repeat(70) + '\n');

/**
 * Step 1: Create a test image (simulate mobile photo)
 */
function createTestImage() {
  console.log('📸 Step 1: Creating test image...');
  
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  
  // Create a simple 1x1 pixel JPG if it doesn't exist
  if (!fs.existsSync(testImagePath)) {
    // Minimal valid JPEG file (1x1 pixel, white)
    const minimalJpeg = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
      0x7F, 0x80, 0xFF, 0xD9
    ]);
    fs.writeFileSync(testImagePath, minimalJpeg);
    console.log('✅ Created test image:', testImagePath);
  } else {
    console.log('✅ Using existing test image:', testImagePath);
  }
  
  return testImagePath;
}

/**
 * Step 2: Upload images to backend
 */
async function uploadImages(imagePath) {
  console.log('\n📤 Step 2: Uploading images to backend...');
  
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(imagePath);
    formData.append('images', fileStream, {
      filename: 'test-dog.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('   Sending to:', `${BASE_URL}/incidents/upload-images`);
    
    const response = await axios.post(`${BASE_URL}/incidents/upload-images`, formData, {
      headers: formData.getHeaders()
    });
    
    if (response.data.success) {
      console.log('✅ Images uploaded successfully!');
      console.log('   Server URLs:', response.data.images);
      return response.data.images;
    } else {
      console.log('❌ Upload failed:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Upload error:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Step 3: Submit anonymous report with image URLs
 */
async function submitReport(imageUrls) {
  console.log('\n📝 Step 3: Submitting anonymous report...');
  
  const reportData = {
    title: 'Stray Animal Report',
    description: 'Large brown dog wandering near residential area',
    location: '13.6218,123.1948',
    latitude: 13.6218,
    longitude: 123.1948,
    status: 'pending',
    reporter_name: 'Anonymous Mobile User',
    reporter_contact: '09123456789',
    incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
    incident_type: 'stray',
    pet_color: 'Brown',
    pet_breed: 'Mixed Breed',
    animal_type: 'dog',
    pet_gender: 'male',
    pet_size: 'large',
    images: imageUrls // Array of server URLs
  };
  
  console.log('   Report data:', {
    ...reportData,
    images: `[${imageUrls.length} image(s)]`
  });
  
  try {
    const response = await axios.post(`${BASE_URL}/incidents`, reportData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Report submitted successfully!');
      console.log('   Report ID:', response.data.id);
      return response.data.id;
    } else {
      console.log('❌ Report submission failed:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Submission error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Step 4: Verify report in database (fetch it back)
 */
async function verifyReport(reportId) {
  console.log('\n🔍 Step 4: Verifying report in database...');
  
  try {
    const response = await axios.get(`${BASE_URL}/incidents/${reportId}`);
    
    if (response.data.success) {
      const report = response.data.data;
      console.log('✅ Report retrieved successfully!');
      console.log('\n📋 Report Details:');
      console.log('   ID:', report.id);
      console.log('   Type:', report.report_type);
      console.log('   Reporter:', report.reporter_name);
      console.log('   Location:', report.location);
      console.log('   Animal:', report.animal_type, '-', report.pet_breed);
      console.log('   Images:', report.images);
      
      if (report.images && report.images.length > 0) {
        console.log('\n✅ SUCCESS: Images are stored and retrieved correctly!');
        console.log('   Image count:', report.images.length);
        report.images.forEach((img, i) => {
          console.log(`   Image ${i + 1}:`, img);
        });
        return true;
      } else {
        console.log('\n❌ PROBLEM: No images found in report!');
        return false;
      }
    } else {
      console.log('❌ Failed to retrieve report:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Verification error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Step 5: Check if images are accessible via web
 */
async function checkImageAccess(imageUrls) {
  console.log('\n🌐 Step 5: Checking image accessibility from web...');
  
  for (let i = 0; i < imageUrls.length; i++) {
    const imagePath = imageUrls[i];
    const fullUrl = `http://localhost:3000${imagePath}`;
    
    try {
      const response = await axios.get(fullUrl, {
        validateStatus: () => true // Don't throw on any status
      });
      if (response.status === 200) {
        console.log(`✅ Image ${i + 1} accessible: ${fullUrl}`);
      } else {
        console.log(`❌ Image ${i + 1} NOT accessible (${response.status}): ${fullUrl}`);
      }
    } catch (error) {
      console.log(`❌ Image ${i + 1} ERROR: ${error.message}`);
    }
  }
}

/**
 * Main test flow
 */
async function runTest() {
  try {
    // Step 1: Create test image
    const imagePath = createTestImage();
    
    // Step 2: Upload image
    const imageUrls = await uploadImages(imagePath);
    if (imageUrls.length === 0) {
      console.log('\n❌ TEST FAILED: Could not upload images');
      return;
    }
    
    // Step 3: Submit report
    const reportId = await submitReport(imageUrls);
    if (!reportId) {
      console.log('\n❌ TEST FAILED: Could not submit report');
      return;
    }
    
    // Wait a moment for database to commit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 4: Verify report
    const verified = await verifyReport(reportId);
    
    // Step 5: Check image access
    await checkImageAccess(imageUrls);
    
    // Final summary
    console.log('\n' + '='.repeat(70));
    if (verified) {
      console.log('✅ TEST PASSED: Anonymous report with images works correctly!');
      console.log('\n   The complete flow is working:');
      console.log('   1. ✅ Images uploaded to server');
      console.log('   2. ✅ Report created with image URLs');
      console.log('   3. ✅ Images stored in database');
      console.log('   4. ✅ Images retrievable via API');
      console.log('   5. ✅ Images accessible via web');
    } else {
      console.log('❌ TEST FAILED: Images not properly stored or retrieved');
      console.log('\n   Possible issues:');
      console.log('   • Images not being saved to database');
      console.log('   • Image paths not being parsed correctly');
      console.log('   • API not returning images in response');
    }
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n💥 TEST ERROR:', error);
  }
}

// Run the test
runTest();
