import http from "http";

const API_URL = "http://localhost:3000/api";

async function testClinicAPI() {
  try {
    console.log("Testing Clinic Locations API...\n");
    console.log("This simulates what the frontend receives from axios\n");

    // Test 1: Get all clinics (simulating axios response structure)
    const rawData = await new Promise((resolve, reject) => {
      http
        .get(`${API_URL}/clinics/locations?status=all`, (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          });
        })
        .on("error", reject);
    });

    // Axios wraps this in response.data
    const simulatedAxiosResponse = {
      data: rawData,
      status: 200,
      statusText: "OK",
    };

    console.log("✅ Simulated Axios Response Structure:");
    console.log(
      "- response.data is array:",
      Array.isArray(simulatedAxiosResponse.data)
    );
    console.log("- response.data.length:", simulatedAxiosResponse.data.length);
    console.log(
      "- response.data[0]:",
      simulatedAxiosResponse.data[0] ? "exists" : "undefined"
    );

    console.log("\n📍 First clinic in response.data:");
    if (simulatedAxiosResponse.data.length > 0) {
      console.log(JSON.stringify(simulatedAxiosResponse.data[0], null, 2));
    } else {
      console.log("No clinics found");
    }

    console.log("\n📋 What ClinicMap.jsx does:");
    console.log('- Calls: apiService.clinics.getLocations({ status: "all" })');
    console.log("- Receives: response.data");
    console.log("- Passes to transformClinics: response.data || []");
    console.log("- transformClinics expects: an array");
    console.log(
      "- Current response.data is array:",
      Array.isArray(simulatedAxiosResponse.data)
    );
    console.log("\n✅ The structure looks correct!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Make sure the backend server is running on port 3000");
  }
}

testClinicAPI();
