import { pool } from "./config/database.js";
import dotenv from "dotenv";

dotenv.config();

const addSampleClinics = async () => {
  try {
    console.log("Adding sample clinics with coordinates...");

    // Sample clinics with coordinates in Metro Manila
    const clinics = [
      {
        name: "Paws & Care Veterinary Clinic",
        address: "123 Main St, Manila",
        barangay: "Poblacion",
        latitude: 14.5956,
        longitude: 120.9831,
        contact_number: "02-555-0101",
        email: "pawscare@example.com",
        head_veterinarian: "Dr. Juan dela Cruz",
        license_number: "VET-2024-001",
        status: "Active",
      },
      {
        name: "Metro Veterinary Hospital",
        address: "456 Ayala Avenue, Makati",
        barangay: "Makati",
        latitude: 14.5547,
        longitude: 121.0244,
        contact_number: "02-555-0102",
        email: "metro.vet@example.com",
        head_veterinarian: "Dr. Maria Santos",
        license_number: "VET-2024-002",
        status: "Active",
      },
      {
        name: "BGC Animal Care Center",
        address: "789 BGC Boulevard, Taguig",
        barangay: "Fort Bonifacio",
        latitude: 14.5176,
        longitude: 121.0509,
        contact_number: "02-555-0103",
        email: "bgccare@example.com",
        head_veterinarian: "Dr. Carlos Lopez",
        license_number: "VET-2024-003",
        status: "Active",
      },
      {
        name: "Quezon City Pet Clinic",
        address: "321 Scout Reyes St, QC",
        barangay: "Cubao",
        latitude: 14.676,
        longitude: 121.0437,
        contact_number: "02-555-0104",
        email: "qcpet@example.com",
        head_veterinarian: "Dr. Ana Garcia",
        license_number: "VET-2024-004",
        status: "Pending",
      },
      {
        name: "Pasig Veterinary Services",
        address: "654 Ortigas Ave, Pasig",
        barangay: "Ortigas",
        latitude: 14.5764,
        longitude: 121.0851,
        contact_number: "02-555-0105",
        email: "pasigvet@example.com",
        head_veterinarian: "Dr. Roberto Reyes",
        license_number: "VET-2024-005",
        status: "Active",
      },
    ];

    for (const clinic of clinics) {
      await pool.query(
        `INSERT INTO private_clinic 
        (clinic_name, address, barangay, latitude, longitude, contact_number, email, head_veterinarian, license_number, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clinic.name,
          clinic.address,
          clinic.barangay,
          clinic.latitude,
          clinic.longitude,
          clinic.contact_number,
          clinic.email,
          clinic.head_veterinarian,
          clinic.license_number,
          clinic.status,
        ]
      );
      console.log(`✅ Added: ${clinic.name}`);
    }

    console.log("\n✅ Sample clinics added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding sample clinics:", error);
    process.exit(1);
  }
};

addSampleClinics();
