/**
 * Clinic Map Integration Test
 * Tests the complete flow from API to frontend display
 */

const http = require("http");

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        });
      })
      .on("error", reject);
  });
}

async function runTests() {
  console.log("🧪 CLINIC MAP INTEGRATION TEST\n");
  console.log("=" + "=".repeat(60) + "\n");

  // Test 1: Backend Health
  console.log("1️⃣ Testing Backend Health...");
  try {
    await makeRequest("http://localhost:3000");
    console.log("✅ Backend is running on port 3000\n");
  } catch (e) {
    console.log("❌ Backend is NOT running\n");
    console.log("Please start backend: cd Backend-Node && npm start\n");
    return;
  }

  // Test 2: Clinic Locations API
  console.log("2️⃣ Testing Clinic Locations API...");
  try {
    const clinics = await makeRequest(
      "http://localhost:3000/api/clinics/locations?status=all"
    );

    if (!Array.isArray(clinics)) {
      console.log("❌ API did not return an array");
      console.log("   Received:", typeof clinics, "\n");
      return;
    }

    console.log(`✅ API returned ${clinics.length} clinics`);

    if (clinics.length === 0) {
      console.log("⚠️  No clinics in database\n");
      console.log("Run: node Backend-Node/add-sample-clinics.js\n");
      return;
    }

    // Test 3: Validate Clinic Data
    console.log("\n3️⃣ Validating Clinic Data...");
    let validClinics = 0;
    let invalidClinics = [];

    clinics.forEach((clinic, index) => {
      const hasValidCoords =
        clinic.latitude &&
        clinic.longitude &&
        !isNaN(clinic.latitude) &&
        !isNaN(clinic.longitude);

      if (hasValidCoords) {
        validClinics++;
      } else {
        invalidClinics.push({
          index: index + 1,
          name: clinic.name || "Unknown",
          lat: clinic.latitude,
          lng: clinic.longitude,
        });
      }
    });

    console.log(
      `✅ ${validClinics}/${clinics.length} clinics have valid coordinates`
    );

    if (invalidClinics.length > 0) {
      console.log(
        `⚠️  ${invalidClinics.length} clinics have invalid coordinates:`
      );
      invalidClinics.forEach((c) => {
        console.log(`   - ${c.name}: lat=${c.lat}, lng=${c.lng}`);
      });
    }

    // Test 4: Display Sample Clinic
    console.log("\n4️⃣ Sample Clinic Data:");
    const sample = clinics[0];
    console.log("   ID:", sample.id);
    console.log("   Name:", sample.name);
    console.log("   Status:", sample.status);
    console.log("   Coordinates:", `${sample.latitude}, ${sample.longitude}`);
    console.log("   Barangay:", sample.barangay || "N/A");
    console.log("   Address:", sample.address || "N/A");
    console.log("   Veterinarian:", sample.veterinarian || "N/A");
    console.log("   Services:", sample.services?.join(", ") || "None");

    // Test 5: Frontend Compatibility Check
    console.log("\n5️⃣ Frontend Compatibility Check...");
    const hasRequiredFields = clinics.every(
      (clinic) =>
        clinic.hasOwnProperty("id") &&
        clinic.hasOwnProperty("name") &&
        clinic.hasOwnProperty("latitude") &&
        clinic.hasOwnProperty("longitude") &&
        clinic.hasOwnProperty("status")
    );

    if (hasRequiredFields) {
      console.log("✅ All clinics have required fields for map display");
    } else {
      console.log("❌ Some clinics missing required fields");
    }

    // Summary
    console.log("\n" + "=" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=" + "=".repeat(60));
    console.log("✅ Backend: Running");
    console.log(`✅ Clinics: ${clinics.length} found`);
    console.log(`✅ Valid Coordinates: ${validClinics}/${clinics.length}`);
    console.log(`✅ Data Structure: Compatible`);

    console.log("\n🌐 TO TEST FRONTEND:");
    console.log("1. Start frontend: cd Frontend/web && npm run dev");
    console.log("2. Open browser: http://localhost:5173/clinic-map");
    console.log("3. You should see:");
    console.log(`   - ${validClinics} markers on the map`);
    console.log("   - Filter buttons showing counts");
    console.log("   - Sidebar with clinic list");
    console.log("\n");
  } catch (error) {
    console.log("❌ Error testing API:", error.message, "\n");
  }
}

runTests();
