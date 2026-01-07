import { pool } from "./config/database.js";
import Logger from "./utils/logger.js";

const logger = new Logger("ADD_SAMPLE_CLINICS");

async function addSampleClinics() {
  try {
    logger.info("Adding sample clinics with map coordinates...");

    const sampleClinics = [
      {
        clinic_name: "Manila Veterinary Clinic",
        address: "123 Rizal Avenue, Manila",
        barangay: "Ermita",
        latitude: 14.5995,
        longitude: 120.9842,
        contact_number: "+63 2 1234 5678",
        email: "manila.vet@example.com",
        head_veterinarian: "Dr. Juan Dela Cruz",
        license_number: "VET-MNL-2024-001",
        services: JSON.stringify([
          "Vaccination",
          "Surgery",
          "Emergency Care",
          "Grooming",
        ]),
        operating_hours: JSON.stringify({
          monday: "8AM-6PM",
          tuesday: "8AM-6PM",
          wednesday: "8AM-6PM",
          thursday: "8AM-6PM",
          friday: "8AM-6PM",
          saturday: "8AM-12PM",
          sunday: "Closed",
        }),
        status: "Active",
        permit_expiry_date: "2026-04-07", // 90 days from now
        accreditation_expiry_date: "2026-07-06", // 180 days from now
        inspection_status: "Passed",
      },
      {
        clinic_name: "Quezon City Pet Hospital",
        address: "456 Commonwealth Avenue, Quezon City",
        barangay: "Batasan Hills",
        latitude: 14.676,
        longitude: 121.0437,
        contact_number: "+63 2 9876 5432",
        email: "qc.pet@example.com",
        head_veterinarian: "Dr. Maria Santos",
        license_number: "VET-QC-2024-002",
        services: JSON.stringify([
          "Pet Boarding",
          "Vaccination",
          "Laboratory",
          "X-Ray",
        ]),
        operating_hours: JSON.stringify({
          monday: "7AM-7PM",
          tuesday: "7AM-7PM",
          wednesday: "7AM-7PM",
          thursday: "7AM-7PM",
          friday: "7AM-7PM",
          saturday: "7AM-5PM",
          sunday: "9AM-12PM",
        }),
        status: "Active",
        permit_expiry_date: "2026-05-07", // 120 days from now
        accreditation_expiry_date: "2026-08-05", // 240 days from now
        inspection_status: "Passed",
      },
      {
        clinic_name: "Makati Animal Care Center",
        address: "789 Ayala Avenue, Makati",
        barangay: "Poblacion",
        latitude: 14.5547,
        longitude: 121.0244,
        contact_number: "+63 2 5555 1234",
        email: "makati.animal@example.com",
        head_veterinarian: "Dr. Carlos Reyes",
        license_number: "VET-MKT-2024-003",
        services: JSON.stringify([
          "Surgery",
          "Dental Care",
          "Emergency Care",
          "Diagnostic",
        ]),
        operating_hours: JSON.stringify({
          monday: "24/7",
          tuesday: "24/7",
          wednesday: "24/7",
          thursday: "24/7",
          friday: "24/7",
          saturday: "24/7",
          sunday: "24/7",
        }),
        status: "Active",
        permit_expiry_date: "2026-01-22", // 15 days from now (will trigger warning)
        accreditation_expiry_date: "2026-02-06", // 30 days from now (will trigger warning)
        inspection_status: "Needs Follow-up",
      },
      {
        clinic_name: "Pasig Paws & Claws Clinic",
        address: "321 C5 Road, Pasig",
        barangay: "Kapitolyo",
        latitude: 14.5764,
        longitude: 121.0851,
        contact_number: "+63 2 8888 9999",
        email: "pasig.paws@example.com",
        head_veterinarian: "Dr. Anna Reyes",
        license_number: "VET-PSG-2024-004",
        services: JSON.stringify(["Grooming", "Vaccination", "Pet Supplies"]),
        operating_hours: JSON.stringify({
          monday: "9AM-6PM",
          tuesday: "9AM-6PM",
          wednesday: "9AM-6PM",
          thursday: "9AM-6PM",
          friday: "9AM-6PM",
          saturday: "9AM-3PM",
          sunday: "Closed",
        }),
        status: "Temporarily Closed",
        permit_expiry_date: "2026-03-07",
        accreditation_expiry_date: "2026-06-05",
        inspection_status: "Pending",
      },
      {
        clinic_name: "Taguig Veterinary Services",
        address: "555 McKinley Road, Taguig",
        barangay: "Fort Bonifacio",
        latitude: 14.5176,
        longitude: 121.0509,
        contact_number: "+63 2 7777 4444",
        email: "taguig.vet@example.com",
        head_veterinarian: "Dr. Roberto Cruz",
        license_number: "VET-TAG-2024-005",
        services: JSON.stringify([
          "Surgery",
          "Vaccination",
          "Emergency Care",
          "Pet Training",
        ]),
        operating_hours: JSON.stringify({
          monday: "8AM-8PM",
          tuesday: "8AM-8PM",
          wednesday: "8AM-8PM",
          thursday: "8AM-8PM",
          friday: "8AM-8PM",
          saturday: "8AM-5PM",
          sunday: "10AM-2PM",
        }),
        status: "Active",
        permit_expiry_date: "2026-06-07",
        accreditation_expiry_date: "2026-09-05",
        inspection_status: "Passed",
      },
    ];

    for (const clinic of sampleClinics) {
      try {
        await pool.query(
          `INSERT INTO private_clinic (
            clinic_name, address, barangay, latitude, longitude,
            contact_number, email, head_veterinarian, license_number,
            services, operating_hours, status,
            permit_expiry_date, accreditation_expiry_date, inspection_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            clinic.clinic_name,
            clinic.address,
            clinic.barangay,
            clinic.latitude,
            clinic.longitude,
            clinic.contact_number,
            clinic.email,
            clinic.head_veterinarian,
            clinic.license_number,
            clinic.services,
            clinic.operating_hours,
            clinic.status,
            clinic.permit_expiry_date,
            clinic.accreditation_expiry_date,
            clinic.inspection_status,
          ]
        );
        logger.info(`✓ Added: ${clinic.clinic_name}`);
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          logger.info(`  Skipped (already exists): ${clinic.clinic_name}`);
        } else {
          logger.warn(`  Error adding ${clinic.clinic_name}: ${error.message}`);
        }
      }
    }

    // Get summary
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) as with_coordinates,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active
      FROM private_clinic
    `);

    logger.info("\nClinic Summary:");
    logger.info(`  Total Clinics: ${stats[0].total}`);
    logger.info(`  With Coordinates: ${stats[0].with_coordinates}`);
    logger.info(`  Active: ${stats[0].active}`);

    logger.success("\n✓ Sample clinics added successfully!");
  } catch (error) {
    logger.error("Error adding sample clinics:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

addSampleClinics().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
