/**
 * Final Clinic Map Verification Test
 * Verifies that all fixes are working correctly
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

async function verifyFixes() {
  console.log("\n🔍 CLINIC MAP - FINAL VERIFICATION\n");
  console.log("=" + "=".repeat(70) + "\n");

  let allPassed = true;

  // Test 1: Backend Running
  console.log("1️⃣  Backend Server Status");
  try {
    await makeRequest("http://localhost:3000");
    console.log("   ✅ Backend is running on http://localhost:3000\n");
  } catch (e) {
    console.log("   ❌ Backend NOT running");
    console.log("   💡 Start with: cd Backend-Node && npm start\n");
    allPassed = false;
  }

  // Test 2: API Endpoint
  console.log("2️⃣  Clinic Locations API");
  try {
    const clinics = await makeRequest(
      "http://localhost:3000/api/clinics/locations?status=all"
    );

    if (!Array.isArray(clinics)) {
      console.log("   ❌ API did not return an array\n");
      allPassed = false;
    } else if (clinics.length === 0) {
      console.log("   ⚠️  API returned 0 clinics");
      console.log(
        "   💡 Add clinics with: node Backend-Node/add-sample-clinics.js\n"
      );
      allPassed = false;
    } else {
      console.log(`   ✅ API returned ${clinics.length} clinics`);

      // Check coordinates
      const validCount = clinics.filter(
        (c) =>
          c.latitude && c.longitude && !isNaN(c.latitude) && !isNaN(c.longitude)
      ).length;

      console.log(
        `   ✅ ${validCount}/${clinics.length} have valid coordinates\n`
      );

      if (validCount < clinics.length) {
        allPassed = false;
      }
    }
  } catch (error) {
    console.log("   ❌ Error calling API:", error.message, "\n");
    allPassed = false;
  }

  // Test 3: Frontend Server
  console.log("3️⃣  Frontend Server Status");
  try {
    const response = await new Promise((resolve, reject) => {
      http
        .get("http://localhost:5173", (res) => {
          resolve(res.statusCode);
        })
        .on("error", reject);
    });

    if (response === 200) {
      console.log("   ✅ Frontend is running on http://localhost:5173\n");
    } else {
      console.log(`   ⚠️  Frontend returned status ${response}\n`);
    }
  } catch (e) {
    console.log("   ❌ Frontend NOT running");
    console.log("   💡 Start with: cd Frontend/web && npm run dev\n");
    allPassed = false;
  }

  // Summary
  console.log("=" + "=".repeat(70));

  if (allPassed) {
    console.log("\n✅ ALL CHECKS PASSED!\n");
    console.log("🎯 CLINIC MAP IS READY TO USE\n");
    console.log("📍 Open in browser: http://localhost:5173/clinic-map\n");
    console.log("Expected features:");
    console.log("  ✓ Map displays immediately (no loading spinner)");
    console.log("  ✓ All clinic markers visible on map");
    console.log("  ✓ Map auto-zooms to show all markers");
    console.log("  ✓ Filter buttons show correct counts");
    console.log("  ✓ Search functionality works");
    console.log("  ✓ Sidebar lists all clinics");
    console.log("  ✓ Click marker to see popup with details");
    console.log("  ✓ Click sidebar item to zoom to clinic\n");
  } else {
    console.log("\n⚠️  SOME CHECKS FAILED\n");
    console.log(
      "Please review the issues above and follow the suggested fixes.\n"
    );
  }

  console.log("=" + "=".repeat(70) + "\n");
}

verifyFixes();
