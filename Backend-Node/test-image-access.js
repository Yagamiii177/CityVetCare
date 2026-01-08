import fetch from "node-fetch";

async function testImageAccess() {
  const imageUrl =
    "http://localhost:3000/uploads/announcements/1767805396588-188520296.png";

  console.log(`🔍 Testing image access: ${imageUrl}\n`);

  try {
    const response = await fetch(imageUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);
    console.log(
      `Content-Length: ${response.headers.get("content-length")} bytes`
    );

    if (response.ok) {
      console.log("\n✅ Image is accessible!");
    } else {
      console.log("\n❌ Image not accessible");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

testImageAccess();
