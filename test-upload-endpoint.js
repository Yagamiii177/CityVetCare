import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:3000/api';

console.log('🧪 Testing Upload Images Endpoint\n');
console.log('=' .repeat(50));

async function testUploadEndpoint() {
  try {
    // Create a simple test file
    const testDir = path.join(__dirname, 'test-uploads');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    
    const testFilePath = path.join(testDir, 'test-image.txt');
    fs.writeFileSync(testFilePath, 'This is a test image file');
    
    const formData = new FormData();
    formData.append('images', fs.createReadStream(testFilePath), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('\n📤 Testing POST /api/incidents/upload-images');
    console.log('-'.repeat(50));
    
    const response = await fetch(`${API_URL}/incidents/upload-images`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Upload endpoint is working!');
      console.log('Image URLs returned:', data.images || data.data?.images);
    } else {
      console.log('\n❌ Upload endpoint failed');
    }
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.rmdirSync(testDir);
    
  } catch (error) {
    console.error('\n❌ Error testing upload endpoint:', error.message);
  }
}

// Run test
testUploadEndpoint();
