const axios = require("axios");

async function testClinicLocationsAPI() {
  try {
    console.log("🧪 Testing Clinic Locations API...\n");

    const apiUrl = "http://localhost:3000/api/clinics/locations?status=all";
    console.log(`📡 Calling: ${apiUrl}\n`);

    const response = await axios.get(apiUrl);

    console.log("✅ API Response received!");
    console.log("Status:", response.status);
    console.log("Data type:", typeof response.data);
    console.log("Is array:", Array.isArray(response.data));
    console.log("Data length:", response.data?.length);
    console.log("\n📊 Response data:");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data && response.data.length > 0) {
      console.log("\n🏥 First clinic details:");
      const first = response.data[0];
      console.log("  ID:", first.id);
      console.log("  Name:", first.name);
      console.log("  Latitude:", first.latitude);
      console.log("  Longitude:", first.longitude);
      console.log("  Status:", first.status);
      console.log(
        "  Valid coordinates:",
        !isNaN(first.latitude) && !isNaN(first.longitude)
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testClinicLocationsAPI();
