import FormData from "form-data";
import fetch from "node-fetch";

const testCreate = async () => {
  try {
    console.log("Testing POST /api/announcements...\n");

    const formData = new FormData();
    formData.append("title", "Test Announcement");
    formData.append("content", "Test content");
    formData.append("description", "Test description");
    formData.append("category", "general");
    formData.append("priority", "Medium");
    formData.append("status", "Draft");
    formData.append("author", "Test Author");
    formData.append("audience", "public");

    console.log("Sending request to http://localhost:3000/api/announcements");
    console.log();

    const response = await fetch("http://localhost:3000/api/announcements", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Success!");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      console.log("❌ Error Response:");
      console.log("Status:", response.status);
      console.log("Body:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
  }
};

testCreate();
