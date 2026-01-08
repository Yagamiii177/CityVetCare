import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";

async function testAnnouncementUpload() {
  try {
    console.log("🧪 Testing announcement creation with image upload...\n");

    // Create a simple test image (1x1 pixel PNG)
    const testImagePath = "test-image.png";
    const testImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(testImagePath, testImageBuffer);
    console.log("✅ Created test image");

    // Create FormData
    const formData = new FormData();
    formData.append("title", "Test Announcement with Image");
    formData.append(
      "content",
      "This is a test announcement with an attached image."
    );
    formData.append("description", "Testing image upload functionality");
    formData.append("category", "general");
    formData.append("status", "Published");
    formData.append("priority", "Medium");

    // Append the test image
    formData.append("attachments", fs.createReadStream(testImagePath), {
      filename: "test.png",
      contentType: "image/png",
    });

    console.log(
      "📤 Sending POST request to http://localhost:3000/api/announcements"
    );

    // Send request
    const response = await fetch("http://localhost:3000/api/announcements", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    const result = await response.json();

    console.log("\n📥 Response status:", response.status);
    console.log("📥 Response body:", JSON.stringify(result, null, 2));

    if (result.data && result.data.attachments) {
      console.log("\n✅ SUCCESS! Attachments saved:");
      result.data.attachments.forEach((att) => {
        console.log(`   - ${att.fileName}: ${att.fileUrl}`);
      });
    } else {
      console.log("\n⚠️  WARNING: No attachments in response");
    }

    // Cleanup
    fs.unlinkSync(testImagePath);
    console.log("\n🧹 Cleaned up test image");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
  }
}

testAnnouncementUpload();
