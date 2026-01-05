/**
 * Test Authentication System
 * Run: node test-auth.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Test user data
const testUser = {
  username: 'testuser123',
  password: 'password123',
  email: 'testuser123@example.com',
  full_name: 'Test User',
  contact_number: '09123456789',
  address: '123 Test Street'
};

/**
 * Test registration
 */
async function testRegistration() {
  console.log('\n===== Testing Registration =====');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('User ID:', data.user.id);
      console.log('Username:', data.user.username);
      console.log('Access Token:', data.accessToken ? 'Generated' : 'Missing');
      return { success: true, tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken } };
    } else {
      console.log('❌ Registration failed:', data.message);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return { success: false };
  }
}

/**
 * Test login
 */
async function testLogin() {
  console.log('\n===== Testing Login =====');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', data.user.full_name);
      console.log('Role:', data.user.role);
      console.log('Access Token:', data.accessToken ? 'Generated' : 'Missing');
      return { success: true, tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken } };
    } else {
      console.log('❌ Login failed:', data.message);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return { success: false };
  }
}

/**
 * Test authenticated request
 */
async function testAuthenticatedRequest(accessToken) {
  console.log('\n===== Testing Authenticated Request =====');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Authenticated request successful!');
      console.log('User data retrieved:', data.user.username);
      return { success: true };
    } else {
      console.log('❌ Authenticated request failed:', data.message);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Authenticated request error:', error.message);
    return { success: false };
  }
}

/**
 * Test anonymous incident report
 */
async function testAnonymousReport() {
  console.log('\n===== Testing Anonymous Incident Report =====');
  
  try {
    const reportData = {
      title: 'Test Emergency Report',
      description: 'This is a test emergency report without authentication',
      location: '14.5995,120.9842',
      latitude: 14.5995,
      longitude: 120.9842,
      status: 'pending',
      reporter_name: 'Anonymous User',
      reporter_contact: '09123456789',
      incident_date: new Date().toISOString().replace('T', ' ').split('.')[0],
      incident_type: 'incident',
      pet_color: 'Brown',
      pet_breed: 'Aspin',
      animal_type: 'dog',
      pet_gender: 'male',
      pet_size: 'medium',
      images: []
    };

    const response = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Anonymous report submitted successfully!');
      console.log('Report ID:', data.id);
      return { success: true };
    } else {
      console.log('❌ Anonymous report failed:', data.message);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Anonymous report error:', error.message);
    return { success: false };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 CityVetCare Authentication System Test');
  console.log('==========================================');
  
  // Test health check first
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Backend is running!');
      console.log('Database:', healthData.database === 'connected' ? 'Connected' : 'Not connected');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    console.log('Make sure the backend server is running on http://localhost:3000');
    return;
  }

  // Run tests
  const regResult = await testRegistration();
  const loginResult = await testLogin();
  
  if (loginResult.success && loginResult.tokens) {
    await testAuthenticatedRequest(loginResult.tokens.accessToken);
  }
  
  await testAnonymousReport();
  
  console.log('\n==========================================');
  console.log('✅ All tests completed!');
}

// Run the tests
runTests();
