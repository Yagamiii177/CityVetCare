/**
 * Test Campaign Analytics API
 * Run this to verify the backend endpoints are working
 */

const testAPI = async () => {
  const BASE_URL = "http://localhost:3000/api";

  console.log("🧪 Testing Campaign Analytics API\n");

  try {
    // Test 1: Overview
    console.log("1️⃣ Testing /campaign-analytics/overview");
    const overviewResponse = await fetch(
      `${BASE_URL}/campaign-analytics/overview`
    );
    const overviewData = await overviewResponse.json();
    console.log("   Status:", overviewResponse.status);
    console.log("   Data:", JSON.stringify(overviewData, null, 2));
    console.log("");

    // Test 2: Engagement
    console.log("2️⃣ Testing /campaign-analytics/engagement");
    const engagementResponse = await fetch(
      `${BASE_URL}/campaign-analytics/engagement?period=30`
    );
    const engagementData = await engagementResponse.json();
    console.log("   Status:", engagementResponse.status);
    console.log(
      "   Data:",
      JSON.stringify(engagementData, null, 2).substring(0, 200) + "..."
    );
    console.log("");

    // Test 3: Status Summary
    console.log("3️⃣ Testing /campaign-analytics/status-summary");
    const statusResponse = await fetch(
      `${BASE_URL}/campaign-analytics/status-summary`
    );
    const statusData = await statusResponse.json();
    console.log("   Status:", statusResponse.status);
    console.log(
      "   Data:",
      JSON.stringify(statusData, null, 2).substring(0, 200) + "..."
    );
    console.log("");

    // Test 4: Performance
    console.log("4️⃣ Testing /campaign-analytics/performance/month");
    const performanceResponse = await fetch(
      `${BASE_URL}/campaign-analytics/performance/month`
    );
    const performanceData = await performanceResponse.json();
    console.log("   Status:", performanceResponse.status);
    console.log("   Data:", JSON.stringify(performanceData, null, 2));
    console.log("");

    // Test 5: Materials Overview
    console.log("5️⃣ Testing /campaign-analytics/materials-overview");
    const materialsResponse = await fetch(
      `${BASE_URL}/campaign-analytics/materials-overview`
    );
    const materialsData = await materialsResponse.json();
    console.log("   Status:", materialsResponse.status);
    console.log("   Data:", JSON.stringify(materialsData, null, 2));
    console.log("");

    console.log("✅ All tests completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("   Make sure the backend server is running on port 3000");
  }
};

testAPI();
