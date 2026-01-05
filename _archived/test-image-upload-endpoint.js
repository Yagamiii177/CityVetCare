/**
 * Test Image Upload Endpoint
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://192.168.0.108:3000/api';

async function testImageUpload() {
  console.log('\n🖼️  Testing Image Upload Endpoint');
  console.log('=====================================\n');

  // Test 1: Check endpoint exists
  console.log('Test 1: Endpoint availability check...');
  try {
    const response = await fetch(`${BASE_URL}/incidents/upload-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: new FormData() // Empty form data
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', data);

    if (response.status === 400 && data.message === 'No images uploaded') {
      console.log('✅ Endpoint exists and is responding correctly!');
    } else {
      console.log('⚠️  Unexpected response');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Check URL construction
  console.log('\nTest 2: URL Construction Check...');
  const INCIDENTS_CREATE = `${BASE_URL}/incidents`;
  const uploadUrl = `${INCIDENTS_CREATE}/upload-images`;
  console.log('incidents.create:', INCIDENTS_CREATE);
  console.log('Upload URL:', uploadUrl);
  console.log('Expected:', `${BASE_URL}/incidents/upload-images`);
  console.log('Match:', uploadUrl === `${BASE_URL}/incidents/upload-images` ? '✅' : '❌');
}

testImageUpload();
