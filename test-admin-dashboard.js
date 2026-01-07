/**
 * Test Admin Dashboard Backend Connectivity
 * Run: node test-admin-dashboard.js
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api";

const tests = [
  {
    name: "Get Dashboard Statistics",
    method: "GET",
    url: `${API_BASE_URL}/admin-dashboard/stats`,
  },
  {
    name: "Get Pending Clinics",
    method: "GET",
    url: `${API_BASE_URL}/admin-dashboard/pending-clinics?limit=5`,
  },
  {
    name: "Get Activity Log",
    method: "GET",
    url: `${API_BASE_URL}/admin-dashboard/activity?limit=10`,
  },
  {
    name: "Get Analytics",
    method: "GET",
    url: `${API_BASE_URL}/admin-dashboard/analytics`,
  },
  {
    name: "Get Alerts",
    method: "GET",
    url: `${API_BASE_URL}/admin-dashboard/alerts`,
  },
  {
    name: "Get Clinic Locations (for map)",
    method: "GET",
    url: `${API_BASE_URL}/clinics/locations?status=all`,
  },
];

async function runTests() {
  console.log("\n🧪 Testing Admin Dashboard Backend Endpoints\n");
  console.log("=".repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📍 ${test.name}...`);

      const response = await axios({
        method: test.method,
        url: test.url,
      });

      if (response.status === 200) {
        console.log(`✅ PASS - Status: ${response.status}`);

        // Log sample data structure
        const data = response.data.data || response.data;
        if (Array.isArray(data)) {
          console.log(`   📊 Returned ${data.length} items`);
          if (data.length > 0) {
            console.log(
              `   📋 Sample keys: ${Object.keys(data[0])
                .slice(0, 5)
                .join(", ")}`
            );
          }
        } else if (typeof data === "object") {
          console.log(`   📋 Data keys: ${Object.keys(data).join(", ")}`);
        }

        passed++;
      } else {
        console.log(`⚠️  Unexpected status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(
          `   Message: ${error.response.data?.message || "Unknown error"}`
        );
      }
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Admin Dashboard backend is ready.");
    console.log("\n✅ Next steps:");
    console.log("   1. Start frontend: cd Frontend/web && npm run dev");
    console.log("   2. Navigate to: http://localhost:5173/admin-dashboard");
    console.log("   3. View the fully functional Admin Dashboard!\n");
  } else {
    console.log("\n⚠️  Some tests failed. Please check:");
    console.log("   - Backend server is running (npm start in Backend-Node)");
    console.log("   - Database is connected");
    console.log("   - API routes are properly registered\n");
  }
}

// Run tests
runTests().catch((error) => {
  console.error("\n💥 Test runner error:", error.message);
  process.exit(1);
});
