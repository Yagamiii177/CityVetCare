const axios = require('axios');

async function test() {
  try {
    console.log('Testing http://localhost:3000/api/health');
    const response = await axios.get('http://localhost:3000/api/health');
    console.log('Success:', response.status, response.data);
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('No response received');
      console.log('Request:', error.request);
    } else {
      console.log('Setup error:', error.message);
    }
  }
}

test();
