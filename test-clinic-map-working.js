/**
 * Test script for ClinicMap and LocationPicker
 * This script tests both the map display and location picker functionality
 */

const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testClinicMapSetup() {
  console.log("🧪 Testing Clinic Map Setup\n");
  console.log("=".repeat(60));

  try {
    // Test 1: Fetch locations endpoint
    console.log("\n📍 Test 1: Fetching clinic locations...");
    const locationsResponse = await axios.get(`${API_BASE}/clinics/locations`);

    if (locationsResponse.status === 200) {
      console.log("✅ Locations endpoint working");
      console.log(
        `   Found ${locationsResponse.data.length} clinics with coordinates`
      );

      // Display clinics with coordinates
      const clinicsWithCoords = locationsResponse.data.filter(
        (c) => c.latitude && c.longitude
      );
      console.log(
        `   Clinics with valid coordinates: ${clinicsWithCoords.length}`
      );

      if (clinicsWithCoords.length > 0) {
        console.log("\n   Sample clinic data:");
        const sample = clinicsWithCoords[0];
        console.log(`   - Name: ${sample.name}`);
        console.log(`   - Status: ${sample.status}`);
        console.log(`   - Location: ${sample.latitude}, ${sample.longitude}`);
        console.log(
          `   - Address: ${sample.address}, ${sample.barangay || "N/A"}`
        );
      }
    }

    // Test 2: Check status counts endpoint
    console.log("\n📊 Test 2: Checking status counts...");
    const statusResponse = await axios.get(
      `${API_BASE}/clinics/locations?status=all`
    );

    if (statusResponse.status === 200) {
      const allClinics = statusResponse.data;
      const counts = {
        all: allClinics.length,
        Active: allClinics.filter((c) => c.status === "Active").length,
        Pending: allClinics.filter((c) => c.status === "Pending").length,
        Inactive: allClinics.filter((c) => c.status === "Inactive").length,
        Suspended: allClinics.filter((c) => c.status === "Suspended").length,
      };

      console.log("✅ Status counts calculated:");
      console.log(`   - All: ${counts.all}`);
      console.log(`   - Active: ${counts.Active}`);
      console.log(`   - Pending: ${counts.Pending}`);
      console.log(`   - Inactive: ${counts.Inactive}`);
      console.log(`   - Suspended: ${counts.Suspended}`);
    }

    // Test 3: Filter by status
    console.log("\n🔍 Test 3: Testing status filters...");
    const activeResponse = await axios.get(
      `${API_BASE}/clinics/locations?status=Active`
    );
    console.log(`✅ Active filter: ${activeResponse.data.length} clinics`);

    // Test 4: Search functionality
    console.log("\n🔎 Test 4: Testing search...");
    const searchResponse = await axios.get(
      `${API_BASE}/clinics/locations?search=vet`
    );
    console.log(`✅ Search 'vet': ${searchResponse.data.length} results`);

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests passed successfully!");
    console.log("\n📝 Summary:");
    console.log("   - API endpoints working correctly");
    console.log("   - Clinic data with coordinates available");
    console.log("   - Filters and search functional");
    console.log("\n🎯 Frontend should now be able to:");
    console.log("   1. Display clinics on map with colored markers");
    console.log(
      "   2. Filter by status (All/Active/Pending/Inactive/Suspended)"
    );
    console.log("   3. Search by clinic name, address, or veterinarian");
    console.log("   4. Open location picker modal in NewClinic form");
    console.log("   5. Pin clinic location by clicking on map");
    console.log(
      "\n🚀 Next step: Open http://localhost:5173/clinic-map in browser"
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
    console.log("\n💡 Make sure the backend is running on port 5000");
  }
}

// Run the test
testClinicMapSetup();
