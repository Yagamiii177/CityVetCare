/**
 * Test script to verify image upload functionality
 * Run this after starting the backend server
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000/api';

async function testImageUpload() {
  console.log('🧪 Testing Image Upload API...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data);
    console.log('');

    // Test 2: Check if upload endpoint accepts requests
    console.log('2️⃣ Testing upload endpoint with no files...');
    try {
      const emptyFormData = new FormData();
      await axios.post(`${API_BASE_URL}/incidents/upload-images`, emptyFormData, {
        headers: emptyFormData.getHeaders()
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Endpoint correctly rejects empty uploads:', error.response.data.message);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 3: Create a test image (1x1 PNG) and upload it
    console.log('3️⃣ Creating test image...');
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    // Create a simple 1x1 red pixel PNG
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 size
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, // Red pixel data
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D,
      0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
      0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    fs.writeFileSync(testImagePath, pngBuffer);
    console.log('✅ Test image created:', testImagePath);
    console.log('');

    // Test 4: Upload the test image
    console.log('4️⃣ Uploading test image...');
    const formData = new FormData();
    formData.append('images', fs.createReadStream(testImagePath));
    
    const uploadResponse = await axios.post(
      `${API_BASE_URL}/incidents/upload-images`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('✅ Upload successful!');
    console.log('   Response:', JSON.stringify(uploadResponse.data, null, 2));
    console.log('   Image URLs:', uploadResponse.data.images);
    console.log('');

    // Test 5: Verify the uploaded image exists
    console.log('5️⃣ Verifying uploaded image...');
    const imageUrl = uploadResponse.data.images[0];
    const fullImageUrl = `http://localhost:3000${imageUrl}`;
    
    const imageCheckResponse = await axios.get(fullImageUrl, {
      responseType: 'arraybuffer'
    });
    
    console.log('✅ Image is accessible!');
    console.log('   URL:', fullImageUrl);
    console.log('   Size:', imageCheckResponse.data.length, 'bytes');
    console.log('   Content-Type:', imageCheckResponse.headers['content-type']);
    console.log('');

    // Cleanup
    console.log('6️⃣ Cleaning up test file...');
    fs.unlinkSync(testImagePath);
    console.log('✅ Test file deleted');
    console.log('');

    console.log('🎉 All tests passed! Image upload is working correctly.\n');
    console.log('📝 Summary:');
    console.log('   - Backend is running ✅');
    console.log('   - Upload endpoint is working ✅');
    console.log('   - Images are being stored ✅');
    console.log('   - Images are accessible via URL ✅');
    console.log('\n✨ You can now test image upload in the web application!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testImageUpload();
