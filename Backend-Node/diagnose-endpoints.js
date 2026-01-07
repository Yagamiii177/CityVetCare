/**
 * Quick Diagnostic Tool for "No Endpoint Detected" Issues
 * Run this to diagnose connectivity problems
 */

import axios from 'axios';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

const API_URLS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.0.108:3000'
];

console.log(`\n${'='.repeat(60)}`);
console.log(`${colors.blue}CityVetCare - Endpoint Connectivity Diagnostic${colors.reset}`);
console.log(`${'='.repeat(60)}\n`);

async function testUrl(baseUrl) {
  console.log(`\n${colors.yellow}Testing: ${baseUrl}${colors.reset}`);
  
  const tests = [
    { endpoint: '/', name: 'Root' },
    { endpoint: '/api/health', name: 'Health Check' },
    { endpoint: '/api/incidents', name: 'Get Incidents' }
  ];
  
  for (const test of tests) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${baseUrl}${test.endpoint}`, {
        timeout: 5000
      });
      const duration = Date.now() - startTime;
      
      console.log(`  ${colors.green}✓${colors.reset} ${test.name.padEnd(20)} - Status: ${response.status} (${duration}ms)`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`  ${colors.red}✗${colors.reset} ${test.name.padEnd(20)} - Connection Refused (Server not running?)`);
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        console.log(`  ${colors.red}✗${colors.reset} ${test.name.padEnd(20)} - Timeout (Network issue?)`);
      } else if (error.response) {
        console.log(`  ${colors.yellow}△${colors.reset} ${test.name.padEnd(20)} - Status: ${error.response.status}`);
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${test.name.padEnd(20)} - ${error.message}`);
      }
    }
  }
}

async function checkEnvironment() {
  console.log(`\n${colors.yellow}Environment Information:${colors.reset}`);
  console.log(`  Node Version: ${process.version}`);
  console.log(`  Platform: ${process.platform}`);
  console.log(`  Current Time: ${new Date().toLocaleString()}`);
  
  // Check if .env files exist
  const fs = await import('fs');
  const path = await import('path');
  
  console.log(`\n${colors.yellow}Configuration Files:${colors.reset}`);
  
  const webEnvPath = path.join(process.cwd(), '..', 'Frontend', 'web', '.env');
  if (fs.existsSync(webEnvPath)) {
    const content = fs.readFileSync(webEnvPath, 'utf8');
    const match = content.match(/VITE_API_URL=(.+)/);
    if (match) {
      console.log(`  ${colors.green}✓${colors.reset} Web .env found: ${match[1].trim()}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} Web .env missing VITE_API_URL`);
    }
  } else {
    console.log(`  ${colors.red}✗${colors.reset} Web .env not found at ${webEnvPath}`);
  }
  
  const mobileConfigPath = path.join(process.cwd(), '..', 'Frontend', 'mobile', 'config', 'api-config.js');
  if (fs.existsSync(mobileConfigPath)) {
    console.log(`  ${colors.green}✓${colors.reset} Mobile api-config.js found`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} Mobile api-config.js not found`);
  }
}

async function recommendSolutions() {
  console.log(`\n${colors.yellow}Common Solutions:${colors.reset}\n`);
  
  console.log(`${colors.blue}1. Backend Server Not Running:${colors.reset}`);
  console.log(`   Run: cd Backend-Node && npm start\n`);
  
  console.log(`${colors.blue}2. Wrong API URL in Frontend:${colors.reset}`);
  console.log(`   Web: Check Frontend/web/.env`);
  console.log(`   Should be: VITE_API_URL=http://localhost:3000/api\n`);
  
  console.log(`${colors.blue}3. Mobile on Physical Device:${colors.reset}`);
  console.log(`   Update Frontend/mobile/config/api-config.js`);
  console.log(`   Use your PC's IP: http://192.168.0.108:3000/api`);
  console.log(`   Both phone and PC must be on SAME WiFi!\n`);
  
  console.log(`${colors.blue}4. CORS Issues:${colors.reset}`);
  console.log(`   Check browser console for CORS errors`);
  console.log(`   Backend allows all origins in development\n`);
  
  console.log(`${colors.blue}5. Firewall Blocking:${colors.reset}`);
  console.log(`   Windows: Allow Node.js through firewall`);
  console.log(`   Check: Windows Security > Firewall\n`);
}

async function runDiagnostics() {
  await checkEnvironment();
  
  for (const url of API_URLS) {
    await testUrl(url);
  }
  
  await recommendSolutions();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}Diagnostic Complete${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);
  
  console.log(`${colors.green}Next Steps:${colors.reset}`);
  console.log(`1. If any URL shows green checkmarks, that URL is working!`);
  console.log(`2. Update your frontend to use the working URL`);
  console.log(`3. If all are red, start the backend server first`);
  console.log(`4. Run comprehensive test: node test-all-endpoints.js\n`);
}

runDiagnostics().catch(error => {
  console.error(`${colors.red}Diagnostic failed:${colors.reset}`, error.message);
  process.exit(1);
});
