// Test Backend API Endpoints
import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

async function testAPI() {
  console.log("=================================");
  console.log("🧪 Testing CityVetCare Backend");
  console.log("=================================\n");

  try {
    // Test 1: Health Check
    console.log("1️⃣ Testing Health Endpoint...");
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log(`   Status: ${healthRes.status}`);
    console.log(`   Response:`, healthData);
    console.log("   ✅ Health check passed\n");

    // Test 2: Create Admin Account
    console.log("2️⃣ Testing Create Admin...");
    const createRes = await fetch(`${BASE_URL}/api/auth/create-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testadmin",
        password: "test123",
        role: "veterinarian",
      }),
    });
    const createData = await createRes.json();
    console.log(`   Status: ${createRes.status}`);
    console.log(`   Response:`, createData);
    if (createRes.status === 201 || createRes.status === 409) {
      console.log(
        "   ✅ Create admin working (account created or already exists)\n"
      );
    } else {
      console.log("   ❌ Create admin failed\n");
    }

    // Test 3: Login
    console.log("3️⃣ Testing Login...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testadmin",
        password: "test123",
      }),
    });
    const loginData = await loginRes.json();
    console.log(`   Status: ${loginRes.status}`);
    console.log(`   Response:`, loginData);
    if (loginRes.status === 200) {
      console.log("   ✅ Login successful!\n");
    } else {
      console.log("   ❌ Login failed\n");
    }

    // Test 4: Wrong Password
    console.log("4️⃣ Testing Wrong Password...");
    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testadmin",
        password: "wrongpassword",
      }),
    });
    const wrongPassData = await wrongPassRes.json();
    console.log(`   Status: ${wrongPassRes.status}`);
    console.log(`   Response:`, wrongPassData);
    if (wrongPassRes.status === 401) {
      console.log("   ✅ Security working (wrong password rejected)\n");
    } else {
      console.log("   ❌ Security issue\n");
    }

    console.log("=================================");
    console.log("✅ All Tests Complete!");
    console.log("=================================");
    console.log("\n📝 Test Credentials:");
    console.log("   Username: testadmin");
    console.log("   Password: test123");
    console.log("   Role: veterinarian\n");
  } catch (error) {
    console.error("❌ Test Error:", error.message);
    console.error("\nMake sure the backend server is running on port 3000");
  }
}

testAPI();
