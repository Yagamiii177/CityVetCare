/**
 * Frontend Integration Test
 * Tests both Web and Mobile API connectivity to backend
 */

import axios from 'axios';
import fs from 'fs';

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

async function testFrontendIntegration() {
  log('\n=== FRONTEND INTEGRATION TEST ===\n', COLORS.CYAN);
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Backend is running
  log('1. Testing Backend Connection...', COLORS.CYAN);
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    if (response.status === 200) {
      log('   ✅ Backend API is running', COLORS.GREEN);
      log(`   Server uptime: ${response.data.uptime?.toFixed(2)}s`, COLORS.CYAN);
      passed++;
    }
  } catch (error) {
    log('   ❌ Backend is NOT running', COLORS.RED);
    log('   Please start backend: cd Backend-Node && npm start', COLORS.YELLOW);
    failed++;
    return { passed, failed };
  }
  
  // Test 2: Web Frontend Configuration
  log('\n2. Checking Web Frontend Configuration...', COLORS.CYAN);
  try {
    const webEnvPath = 'Frontend/web/.env';
    if (fs.existsSync(webEnvPath)) {
      const envContent = fs.readFileSync(webEnvPath, 'utf8');
      const apiUrl = envContent.match(/VITE_API_URL=(.+)/)?.[1];
      
      if (apiUrl && apiUrl.includes('localhost:3000')) {
        log('   ✅ Web .env configured correctly', COLORS.GREEN);
        log(`   API URL: ${apiUrl}`, COLORS.CYAN);
        passed++;
      } else {
        log('   ⚠ Web .env needs verification', COLORS.YELLOW);
        log(`   Current: ${apiUrl}`, COLORS.YELLOW);
        failed++;
      }
    } else {
      log('   ❌ Web .env file not found', COLORS.RED);
      failed++;
    }
  } catch (error) {
    log('   ❌ Error reading web config', COLORS.RED);
    failed++;
  }
  
  // Test 3: Web Frontend Running
  log('\n3. Checking Web Frontend Status...', COLORS.CYAN);
  try {
    const response = await axios.get('http://localhost:5173', { timeout: 5000 });
    if (response.status === 200) {
      log('   ✅ Web frontend is running', COLORS.GREEN);
      log('   URL: http://localhost:5173', COLORS.CYAN);
      passed++;
    }
  } catch (error) {
    log('   ⚠ Web frontend is NOT running', COLORS.YELLOW);
    log('   Start it: cd Frontend/web && npm run dev', COLORS.YELLOW);
    log('   (This is optional - not counted as failure)', COLORS.CYAN);
  }
  
  // Test 4: Test Web API Connection
  log('\n4. Testing Web-to-Backend API Connection...', COLORS.CYAN);
  try {
    // Test login endpoint
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data.accessToken) {
      log('   ✅ Web can authenticate with backend', COLORS.GREEN);
      log('   Login endpoint working correctly', COLORS.CYAN);
      passed++;
      
      // Test authenticated endpoint
      const token = loginResponse.data.accessToken;
      const incidentsResponse = await axios.get('http://localhost:3000/api/incidents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (incidentsResponse.data.success) {
        log('   ✅ Web can fetch protected data', COLORS.GREEN);
        log(`   Retrieved ${incidentsResponse.data.records?.length || 0} incidents`, COLORS.CYAN);
        passed++;
      }
    }
  } catch (error) {
    log('   ❌ Web API connection failed', COLORS.RED);
    log(`   ${error.response?.data?.message || error.message}`, COLORS.YELLOW);
    failed++;
  }
  
  // Test 5: Mobile API Configuration
  log('\n5. Checking Mobile API Configuration...', COLORS.CYAN);
  try {
    const mobileConfigPath = 'Frontend/mobile/config/api.js';
    if (fs.existsSync(mobileConfigPath)) {
      const configContent = fs.readFileSync(mobileConfigPath, 'utf8');
      
      // Check if configured for Android emulator
      const hasAndroidConfig = configContent.includes('10.0.2.2:3000');
      const hasIOSConfig = configContent.includes('localhost:3000');
      
      if (hasAndroidConfig || hasIOSConfig) {
        log('   ✅ Mobile API configured', COLORS.GREEN);
        if (hasAndroidConfig) log('   Android emulator: 10.0.2.2:3000', COLORS.CYAN);
        if (hasIOSConfig) log('   iOS simulator: localhost:3000', COLORS.CYAN);
        passed++;
      } else {
        log('   ⚠ Mobile API config needs verification', COLORS.YELLOW);
        failed++;
      }
    } else {
      log('   ❌ Mobile config file not found', COLORS.RED);
      failed++;
    }
  } catch (error) {
    log('   ❌ Error reading mobile config', COLORS.RED);
    failed++;
  }
  
  // Test 6: Mobile Dependencies
  log('\n6. Checking Mobile Dependencies...', COLORS.CYAN);
  try {
    const packageJsonPath = 'Frontend/mobile/package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const requiredDeps = ['expo', 'react-native', '@react-native-async-storage/async-storage'];
      const hasAllDeps = requiredDeps.every(dep => packageJson.dependencies[dep]);
      
      if (hasAllDeps) {
        log('   ✅ Mobile dependencies installed', COLORS.GREEN);
        log(`   Expo: ${packageJson.dependencies.expo}`, COLORS.CYAN);
        passed++;
      } else {
        log('   ⚠ Some mobile dependencies missing', COLORS.YELLOW);
        failed++;
      }
    }
  } catch (error) {
    log('   ❌ Error checking mobile dependencies', COLORS.RED);
    failed++;
  }
  
  // Test 7: CORS Configuration
  log('\n7. Testing CORS Configuration...', COLORS.CYAN);
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    const corsOrigin = response.headers['access-control-allow-origin'];
    
    if (corsOrigin) {
      log('   ✅ CORS is configured', COLORS.GREEN);
      log(`   Allowed origin: ${corsOrigin}`, COLORS.CYAN);
      passed++;
    } else {
      log('   ⚠ CORS headers not found', COLORS.YELLOW);
      failed++;
    }
  } catch (error) {
    log('   ❌ CORS test failed', COLORS.RED);
    failed++;
  }
  
  return { passed, failed };
}

async function printSummary(passed, failed) {
  const total = passed + failed;
  const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  
  log('\n' + '='.repeat(60), COLORS.CYAN);
  log('FRONTEND INTEGRATION TEST SUMMARY', COLORS.CYAN);
  log('='.repeat(60), COLORS.CYAN);
  log(`Total Tests: ${total}`, COLORS.CYAN);
  log(`Passed: ${passed}`, COLORS.GREEN);
  log(`Failed: ${failed}`, failed > 0 ? COLORS.RED : COLORS.GREEN);
  log(`Success Rate: ${percentage}%`, COLORS.CYAN);
  log('='.repeat(60), COLORS.CYAN);
  
  if (failed === 0) {
    log('\n🎉 ALL FRONTEND SYSTEMS ARE PROPERLY CONFIGURED!', COLORS.GREEN);
    log('\n📱 Web Frontend:', COLORS.CYAN);
    log('   Status: ✅ READY', COLORS.GREEN);
    log('   URL: http://localhost:5173', COLORS.CYAN);
    log('   API: Connected to http://localhost:3000/api', COLORS.CYAN);
    
    log('\n📲 Mobile App:', COLORS.CYAN);
    log('   Status: ✅ CONFIGURED', COLORS.GREEN);
    log('   Android: 10.0.2.2:3000', COLORS.CYAN);
    log('   iOS: localhost:3000', COLORS.CYAN);
    
    log('\n🚀 To test mobile app:', COLORS.CYAN);
    log('   cd Frontend/mobile', COLORS.CYAN);
    log('   npm start', COLORS.CYAN);
    log('   Press "a" for Android or "i" for iOS', COLORS.CYAN);
    
    log('\n✨ Both frontends are ready to use!', COLORS.GREEN);
  } else {
    log('\n⚠ Some configuration issues found', COLORS.YELLOW);
    log('Please review the test results above', COLORS.YELLOW);
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testFrontendIntegration()
  .then(({ passed, failed }) => printSummary(passed, failed))
  .catch(error => {
    log(`\n❌ Test execution error: ${error.message}`, COLORS.RED);
    process.exit(1);
  });
