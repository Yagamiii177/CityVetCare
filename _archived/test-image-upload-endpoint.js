/**
 * Test script to verify image upload endpoint
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://192.168.0.108:3000';

async function testImageUpload() {
  console.log('\n🧪 Testing Image Upload Endpoint\n');
  console.log('='.repeat(50));

  try {
    // Create a test image file (1x1 pixel PNG)
    const testImageData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const testImagePath = path.join(__dirname, 'test-upload-image.png');
    fs.writeFileSync(testImagePath, testImageData);
    console.log('✅ Created test image:', testImagePath);

    // Create form data
    const formData = new FormData();
    formData.append('images', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    console.log('\n📤 Uploading image to:', `${API_URL}/api/incidents/upload-images`);
    console.log('⏱️  Timeout: 120 seconds');

    // Upload image with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 120 second timeout

    const response = await fetch(`${API_URL}/api/incidents/upload-images`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log('📥 Response status:', response.status);

    const result = await response.json();
    console.log('📦 Response data:', JSON.stringify(result, null, 2));

    // Clean up test image
    fs.unlinkSync(testImagePath);
    console.log('🧹 Cleaned up test image');

    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS: Image upload endpoint is working correctly!');
      console.log('📸 Uploaded images:', result.images);
      return true;
    } else {
      console.log('\n❌ FAILED: Image upload returned error');
      console.log('Error:', result.message || result.error);
      return false;
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.name === 'AbortError') {
      console.error('⏱️  Request timed out after 120 seconds');
    }
    return false;
  }
}

// Test creating a complete incident report with image
async function testCompleteReportCreation() {
  console.log('\n\n🧪 Testing Complete Report Creation with Image\n');
  console.log('='.repeat(50));

  try {
    // First, upload an image
    const testImageData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const testImagePath = path.join(__dirname, 'test-report-image.png');
    fs.writeFileSync(testImagePath, testImageData);

    const formData = new FormData();
    formData.append('images', fs.createReadStream(testImagePath), {
      filename: 'report-image.png',
      contentType: 'image/png'
    });

    console.log('📤 Step 1: Uploading image...');
    const uploadResponse = await fetch(`${API_URL}/api/incidents/upload-images`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const uploadResult = await uploadResponse.json();
    console.log('✅ Image uploaded:', uploadResult.images);

    // Clean up test image
    fs.unlinkSync(testImagePath);

    // Now create the incident report with the uploaded image
    const reportData = {
      title: 'Test Stray Animal Report',
      description: 'Test report created via automated test',
      location: '13.721249672039512,123.21083008505207',
      latitude: 13.721249672039512,
      longitude: 123.21083008505207,
      status: 'pending',
      reporter_name: 'Test Mobile User',
      reporter_contact: '09123456789',
      incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
      incident_type: 'stray',
      animal_type: 'dog',
      pet_size: 'medium',
      images: JSON.stringify(uploadResult.images)
    };

    console.log('\n📤 Step 2: Creating incident report...');
    const reportResponse = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData)
    });

    const reportResult = await reportResponse.json();
    console.log('📦 Response:', JSON.stringify(reportResult, null, 2));

    if (reportResponse.ok && reportResult.success) {
      console.log('\n✅ SUCCESS: Complete report with image created successfully!');
      console.log('📋 Report ID:', reportResult.id);
      console.log('📸 Images:', reportResult.data.images);
      return true;
    } else {
      console.log('\n❌ FAILED: Report creation returned error');
      console.log('Error:', reportResult.message || reportResult.error);
      return false;
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    return false;
  }
}

// Run tests
(async () => {
  console.log('\n🚀 Starting Image Upload Tests...\n');
  
  const test1 = await testImageUpload();
  const test2 = await testCompleteReportCreation();

  console.log('\n\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Upload Endpoint: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Complete Report: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50) + '\n');

  process.exit(test1 && test2 ? 0 : 1);
})();
