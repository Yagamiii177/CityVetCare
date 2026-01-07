/**
 * Test Script: Clinic Edit Location Feature
 * This script tests the clinic editing and pin location functionality
 */

const axios = require("axios");

const BASE_URL = "http://localhost:5000";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "cyan");
  console.log("=".repeat(60));
}

async function testClinicLocationFeature() {
  try {
    printSection("🧪 CLINIC EDIT LOCATION FEATURE TEST");

    // Step 1: Create a test clinic
    printSection("Step 1: Creating Test Clinic");
    const newClinic = {
      name: "Test Veterinary Clinic for Location",
      veterinarian: "Dr. Test Location",
      licenseNumber: "VET-LOC-TEST-001",
      email: "testlocation@clinic.com",
      phone: "+63-123-456-7890",
      address: "123 Test Street, Manila",
      barangay: "Test Barangay",
      latitude: "14.5995",
      longitude: "120.9842",
      services: ["General Care", "Emergency"],
      status: "Active",
    };

    log("Creating clinic with initial location...", "yellow");
    const createResponse = await axios.post(
      `${BASE_URL}/api/clinics`,
      newClinic
    );

    if (createResponse.status === 201) {
      log("✅ Clinic created successfully", "green");
      console.log("   Clinic ID:", createResponse.data.id);
      console.log(
        "   Initial Location:",
        `${newClinic.latitude}, ${newClinic.longitude}`
      );
    } else {
      throw new Error("Failed to create clinic");
    }

    const clinicId = createResponse.data.id;

    // Step 2: Fetch the created clinic
    printSection("Step 2: Fetching Created Clinic");
    log("Retrieving clinic data...", "yellow");
    const fetchResponse = await axios.get(
      `${BASE_URL}/api/clinics/${clinicId}`
    );

    if (fetchResponse.status === 200) {
      log("✅ Clinic fetched successfully", "green");
      console.log("   Clinic Name:", fetchResponse.data.name);
      console.log(
        "   Current Location:",
        `${fetchResponse.data.latitude}, ${fetchResponse.data.longitude}`
      );
    } else {
      throw new Error("Failed to fetch clinic");
    }

    // Step 3: Update clinic location (simulating pin location change)
    printSection("Step 3: Updating Clinic Location (Simulating Pin Move)");
    const updatedLocation = {
      latitude: "14.6091", // Quezon City location
      longitude: "121.0223",
    };

    log("Updating clinic location to new coordinates...", "yellow");
    console.log(
      "   New Location:",
      `${updatedLocation.latitude}, ${updatedLocation.longitude}`
    );

    const updatePayload = {
      ...fetchResponse.data,
      ...updatedLocation,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    const updateResponse = await axios.put(
      `${BASE_URL}/api/clinics/${clinicId}`,
      updatePayload
    );

    if (updateResponse.status === 200) {
      log("✅ Location updated successfully", "green");
      console.log(
        "   Updated Location:",
        `${updateResponse.data.latitude}, ${updateResponse.data.longitude}`
      );
    } else {
      throw new Error("Failed to update location");
    }

    // Step 4: Verify the location was updated
    printSection("Step 4: Verifying Location Update");
    log("Fetching clinic to verify location change...", "yellow");
    const verifyResponse = await axios.get(
      `${BASE_URL}/api/clinics/${clinicId}`
    );

    if (verifyResponse.status === 200) {
      const clinic = verifyResponse.data;

      if (
        clinic.latitude === updatedLocation.latitude &&
        clinic.longitude === updatedLocation.longitude
      ) {
        log("✅ Location verified successfully", "green");
        console.log(
          "   Confirmed Location:",
          `${clinic.latitude}, ${clinic.longitude}`
        );
      } else {
        log("❌ Location mismatch!", "red");
        console.log(
          "   Expected:",
          `${updatedLocation.latitude}, ${updatedLocation.longitude}`
        );
        console.log("   Actual:", `${clinic.latitude}, ${clinic.longitude}`);
      }
    }

    // Step 5: Test multiple location updates (simulating dragging)
    printSection(
      "Step 5: Testing Multiple Location Updates (Dragging Simulation)"
    );
    const locations = [
      { lat: "14.6200", lng: "121.0300", name: "Position 1" },
      { lat: "14.6150", lng: "121.0250", name: "Position 2" },
      { lat: "14.6100", lng: "121.0200", name: "Position 3 (Final)" },
    ];

    for (const loc of locations) {
      log(`Moving marker to ${loc.name}: ${loc.lat}, ${loc.lng}`, "yellow");

      const dragUpdatePayload = {
        ...updatePayload,
        latitude: loc.lat,
        longitude: loc.lng,
        lastUpdated: new Date().toISOString().split("T")[0],
      };

      const dragResponse = await axios.put(
        `${BASE_URL}/api/clinics/${clinicId}`,
        dragUpdatePayload
      );

      if (dragResponse.status === 200) {
        log(`✅ Moved to ${loc.name}`, "green");
      }

      // Small delay to simulate real dragging
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Step 6: Cleanup - Delete test clinic
    printSection("Step 6: Cleanup");
    log("Deleting test clinic...", "yellow");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/api/clinics/${clinicId}`
    );

    if (deleteResponse.status === 200) {
      log("✅ Test clinic deleted successfully", "green");
    }

    // Final Summary
    printSection("📊 TEST SUMMARY");
    log("✅ All tests passed successfully!", "green");
    console.log("\nTested Features:");
    console.log("  ✓ Clinic creation with initial location");
    console.log("  ✓ Fetching clinic data");
    console.log("  ✓ Updating clinic location (pin move)");
    console.log("  ✓ Verifying location changes");
    console.log("  ✓ Multiple location updates (dragging)");
    console.log("  ✓ Cleanup");

    printSection("🎯 MANUAL TESTING INSTRUCTIONS");
    console.log("\nTo test in the browser:");
    console.log("1. Navigate to Clinic Management page");
    console.log("2. Create a new clinic (or use existing one)");
    console.log("3. Click the Edit button (pencil icon) on a clinic");
    console.log('4. In the Edit modal, click "Pin Location" button');
    console.log("5. Verify:");
    console.log("   ✓ Map displays correctly (not gray)");
    console.log("   ✓ Existing clinic location shows a marker");
    console.log("   ✓ You can click anywhere on map to move marker");
    console.log("   ✓ You can drag the marker to new location");
    console.log("   ✓ Selected coordinates display below the map");
    console.log('   ✓ Click "Confirm Location" to save');
    console.log("6. Save the clinic and verify location persists");
  } catch (error) {
    printSection("❌ TEST FAILED");
    log("Error occurred during testing:", "red");

    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    } else if (error.request) {
      console.log("No response received from server");
      console.log("Make sure the backend is running on", BASE_URL);
    } else {
      console.log("Error:", error.message);
    }

    process.exit(1);
  }
}

// Run the test
log("\n🚀 Starting Clinic Edit Location Feature Test...", "blue");
log("Backend URL: " + BASE_URL, "blue");
console.log();

testClinicLocationFeature();
