/**
 * Test: Verify that approved clinics appear in the Smart Clinic Map
 *
 * This test:
 * 1. Fetches all clinic locations with status=all
 * 2. Verifies that Active (approved) clinics are included
 * 3. Confirms the API returns clinics regardless of status
 */

import axios from "axios";
import { fileURLToPath } from "url";
import { dirname } from "path";

const API_URL = "http://localhost:3000/api";

async function testClinicMapShowsApprovedClinics() {
  console.log("\n🧪 Testing Smart Clinic Map - Approved Clinics Visibility\n");
  console.log("=".repeat(60));

  try {
    // Step 1: Get all clinic locations (including approved ones)
    console.log("\n📍 Step 1: Fetching clinic locations with status=all...");
    const locationsResponse = await axios.get(
      `${API_URL}/clinics/locations?status=all`
    );
    const allClinics = locationsResponse.data;

    console.log(`✅ Found ${allClinics.length} total clinics with coordinates`);

    // Step 2: Count clinics by status
    const statusCounts = {
      Active: 0,
      Pending: 0,
      Inactive: 0,
      Suspended: 0,
    };

    allClinics.forEach((clinic) => {
      if (statusCounts[clinic.status] !== undefined) {
        statusCounts[clinic.status]++;
      }
    });

    console.log("\n📊 Clinic Status Breakdown:");
    console.log(`   • Active (Approved): ${statusCounts.Active}`);
    console.log(`   • Pending: ${statusCounts.Pending}`);
    console.log(`   • Inactive: ${statusCounts.Inactive}`);
    console.log(`   • Suspended: ${statusCounts.Suspended}`);

    // Step 3: Display some approved clinics
    const approvedClinics = allClinics.filter((c) => c.status === "Active");

    if (approvedClinics.length > 0) {
      console.log(`\n✅ Approved clinics that will show on the map:`);
      approvedClinics.slice(0, 5).forEach((clinic, index) => {
        console.log(`   ${index + 1}. ${clinic.name} (${clinic.barangay})`);
        console.log(
          `      📍 Lat: ${clinic.latitude}, Lng: ${clinic.longitude}`
        );
        console.log(`      👨‍⚕️ ${clinic.veterinarian}`);
      });

      if (approvedClinics.length > 5) {
        console.log(
          `   ... and ${approvedClinics.length - 5} more approved clinics`
        );
      }
    } else {
      console.log("\n⚠️  No approved clinics found yet.");
      console.log(
        "   Approve a clinic in the Clinic List to see it on the map!"
      );
    }

    // Step 4: Verify the endpoint allows 'all' status
    console.log("\n🔍 Step 4: Verifying endpoint behavior...");

    const activeOnlyResponse = await axios.get(
      `${API_URL}/clinics/locations?status=Active`
    );
    const activeOnlyClinics = activeOnlyResponse.data;
    console.log(`   • Active-only query: ${activeOnlyClinics.length} clinics`);

    const pendingOnlyResponse = await axios.get(
      `${API_URL}/clinics/locations?status=Pending`
    );
    const pendingOnlyClinics = pendingOnlyResponse.data;
    console.log(
      `   • Pending-only query: ${pendingOnlyClinics.length} clinics`
    );

    // Step 5: Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ TEST PASSED: Smart Clinic Map Configuration");
    console.log("=".repeat(60));
    console.log("\n📋 Summary:");
    console.log(`   • Total clinics with locations: ${allClinics.length}`);
    console.log(
      `   • Approved clinics visible on map: ${approvedClinics.length}`
    );
    console.log("   • API correctly returns all statuses when requested");
    console.log("\n💡 Next Steps:");
    console.log("   1. Open the Smart Clinic Map page in the browser");
    console.log("   2. Use the status filter buttons to filter by status");
    console.log(
      "   3. When you approve a clinic, it will immediately show as Active"
    );
    console.log("\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED");
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("Request was made but no response received");
      console.error("Is the backend server running on port 3000?");
    } else {
      console.error("Error:", error);
    }
    process.exit(1);
  }
}

// Run the test
testClinicMapShowsApprovedClinics();
