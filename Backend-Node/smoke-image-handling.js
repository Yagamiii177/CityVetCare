const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";

const tinyPngDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6qJw0AAAAASUVORK5CYII=";

const json = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const assertOk = async (res, label) => {
  if (res.ok) return;
  const body = await json(res);
  throw new Error(
    `${label} failed: HTTP ${res.status} ${JSON.stringify(body)}`
  );
};

const postJson = async (path, body) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertOk(res, `POST ${path}`);
  return await json(res);
};

const get = async (path) => {
  const res = await fetch(`${baseUrl}${path}`);
  await assertOk(res, `GET ${path}`);
  return res;
};

const extractId = (obj) =>
  obj?.animal_id ?? obj?.id ?? obj?.data?.animal_id ?? obj?.data?.id;

const run = async () => {
  // 1) Health
  {
    const res = await fetch(`${baseUrl}/api/health`);
    await assertOk(res, "GET /api/health");
  }

  // 2) Create pet owner
  const stamp = Date.now();
  const email = `smoke_${stamp}@test.local`;

  const registerRes = await postJson("/api/auth/register", {
    fullName: `Smoke Test ${stamp}`,
    email,
    password: "test1234",
    confirmPassword: "test1234",
    contactNumber: "09123456789",
    address: "Smoke Address",
  });
  const ownerId = registerRes?.ownerId;
  if (!ownerId)
    throw new Error(
      `Register did not return ownerId: ${JSON.stringify(registerRes)}`
    );

  // 3) Create a stray (captured) with an image
  const strayCreate = await postJson("/api/stray-animals", {
    species: "Dog",
    sex: "Male",
    dateCaptured: new Date().toISOString().slice(0, 10),
    locationCaptured: "Smoke Location",
    images: { img1: tinyPngDataUrl },
    name: `Smoke Stray ${stamp}`,
  });

  const stray = strayCreate?.data ?? strayCreate;
  const strayId = extractId(stray);
  if (!strayId)
    throw new Error(
      `Stray create did not return id: ${JSON.stringify(strayCreate)}`
    );

  // 4) Redemption request with proof images
  const redemptionRes = await postJson("/api/redemption-requests", {
    stray_id: strayId,
    owner_id: ownerId,
    owner_contact: "09123456789",
    remarks: "Smoke redemption",
    proof_images: [tinyPngDataUrl, tinyPngDataUrl],
  });

  const proofImagesRaw = redemptionRes?.data?.proof_images;
  const proofImages =
    typeof proofImagesRaw === "string"
      ? JSON.parse(proofImagesRaw)
      : proofImagesRaw;
  if (!Array.isArray(proofImages) || proofImages.length === 0) {
    throw new Error(
      `Redemption proof_images missing: ${JSON.stringify(redemptionRes)}`
    );
  }

  // Verify proof images reachable
  for (const p of proofImages) {
    if (typeof p !== "string" || !p.startsWith("/uploads/")) {
      throw new Error(`Unexpected proof image path: ${p}`);
    }
    await get(p);
  }

  // 5) Mark stray for adoption
  {
    const res = await fetch(`${baseUrl}/api/stray-animals/${strayId}/adopt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await assertOk(res, `POST /api/stray-animals/${strayId}/adopt`);
  }

  // 6) Adoption request with valid ID image
  const adoptionRes = await postJson("/api/adoption-requests", {
    stray_id: strayId,
    adopter_id: ownerId,
    applicant_details: {
      fullName: `Smoke Adopter ${stamp}`,
      age: "25",
      phone: "09123456789",
      email,
      address: "Smoke Address",
      residenceType: "House",
      ownershipStatus: "Owner",
      confirmInfoTruthful: true,
      validIdImage: tinyPngDataUrl,
    },
  });

  const adoptionDetails = adoptionRes?.data?.applicant_details;
  const validIdPath = adoptionDetails?.validIdImage;
  if (
    !validIdPath ||
    typeof validIdPath !== "string" ||
    !validIdPath.startsWith("/uploads/")
  ) {
    throw new Error(
      `Adoption validIdImage not persisted: ${JSON.stringify(adoptionRes)}`
    );
  }

  await get(validIdPath);

  console.log("SMOKE_OK", {
    ownerId,
    strayId,
    proofImagesCount: proofImages.length,
    validIdPath,
  });
};

run().catch((e) => {
  console.error("SMOKE_FAIL", e);
  process.exit(1);
});
