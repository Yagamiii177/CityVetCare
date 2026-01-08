/**
 * Populate Sample Data Script
 * Inserts 1-3 sample records into each table in the CityVetCare database
 */

import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cityvetcare_db",
  port: process.env.DB_PORT || 3306,
};

async function populateSampleData() {
  let connection;

  try {
    console.log("Connecting to database...");
    connection = await mysql.createConnection(DB_CONFIG);
    console.log(" Connected to database");

    // Sample Administrators
    console.log("\nPopulating administrators...");
    await connection.execute(`
      INSERT IGNORE INTO administrator (full_name, role, username, password) VALUES
      ('Dr. Maria Santos', 'veterinarian', 'drsantos', SHA2('password123', 256)),
      ('Dr. Juan Dela Cruz', 'veterinarian', 'drjuan', SHA2('password123', 256)),
      ('Staff Officer', 'staff', 'staff01', SHA2('password123', 256))
    `);
    console.log(" Administrators inserted");

    // Sample Pet Owners
    console.log("\nPopulating pet owners...");
    await connection.execute(`
      INSERT IGNORE INTO pet_owner (full_name, address, contact_number, email, password, pet_count) VALUES
      ('Alyssa Mercado', '32 San Miguel St, Barangay Sto. Niño, Pasig City', '09171234567', 'alyssa.mercado@mail.com', SHA2('password123', 256), 0),
      ('Patrick Lim', '18 P. Tuazon Blvd, Cubao, Quezon City', '09985551234', 'patrick.lim@mail.com', SHA2('password123', 256), 0),
      ('Kristine dela Cruz', '45 Lopez Jaena St, Jaro, Iloilo City', '09278889900', 'kristine.dc@mail.com', SHA2('password123', 256), 0)
    `);
    console.log(" Pet Owners inserted");

    // Sample Dog Catchers
    console.log("\nPopulating dog catchers...");
    await connection.execute(`
      INSERT IGNORE INTO dog_catcher (full_name, contact_number) VALUES
      ('Carlos Rodriguez', '09456789012'),
      ('Antonio Reyes', '09567890123'),
      ('Miguel Santos', '09678901234')
    `);
    console.log(" Dog Catchers inserted");

    // Sample Pets - Updated with color and markings using fixed options
    console.log("\nPopulating pets...");
    await connection.execute(`
      INSERT IGNORE INTO pet (owner_id, rfid, name, species, breed, age, sex, color, markings, status, capture_count, redemption_count) VALUES
      (1, '123456789', 'Buddy', 'dog', 'Labrador Retriever', 5, 'male', 'Black & White', 'White chest patch', 'active', 0, 0),
      (2, '234567890', 'Mochi', 'cat', 'Siamese', 3, 'female', 'Cream', 'Blue eyes', 'active', 1, 0),
      (3, '345678901', 'Max', 'dog', 'German Shepherd', 7, 'male', 'Brown', 'Black markings on face', 'active', 2, 1)
    `);
    console.log(" Pets inserted");

    // Sample Stray Animals (updated to match current schema)
    console.log("\nPopulating stray animals...");
    await connection.execute(`
      INSERT IGNORE INTO stray_animals (
        rfid,
        name,
        breed,
        species,
        sex,
        color,
        markings,
        sprayed_neutered,
        captured_by,
        date_captured,
        registration_date,
        location_captured,
        status,
        images
      ) VALUES
      ('123456789', 'Buddy', 'Labrador Retriever mix', 'dog', 'male', 'Yellow', 'White chest patch', 0, 'Carlos Rodriguez', CURDATE(), CURDATE(), 'Ortigas Park, Pasig City', 'captured', JSON_OBJECT('front', '/uploads/stray/buddy_front.jpg')),
      ('234567890', 'Mochi', 'Domestic Shorthair', 'cat', 'female', 'Cream', 'Blue eyes', 0, 'Antonio Reyes', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'P. Tuazon, Cubao, QC', 'captured', JSON_OBJECT('front', '/uploads/stray/mochi_front.jpg')),
      (NULL, 'Greyboy', 'Aspin', 'dog', 'male', 'Gray', 'Black ears', 1, 'Miguel Santos', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Naga City Public Market', 'adoption', JSON_OBJECT('front', '/uploads/stray/greyboy_front.jpg'))
    `);
    console.log(" Stray Animals inserted");

    // Sample Private Clinics
    console.log("\nPopulating private clinics...");
    await connection.execute(`
      INSERT IGNORE INTO private_clinic (clinic_name, address, contact_number, status) VALUES
      ('Happy Paws Clinic', '100 Hospital Street', '02-123-4567', 'active'),
      ('Pet Care Center', '200 Medical Avenue', '02-234-5678', 'active'),
      ('Veterinary Plus', '300 Health Road', '02-345-6789', 'active')
    `);
    console.log(" Private Clinics inserted");

    // Sample Vaccination Records
    console.log("\nPopulating vaccination records...");
    await connection.execute(`
      INSERT IGNORE INTO vaccination_record (pet_id, clinic_id, vaccine_type, date_administered, next_due_date, source) VALUES
      (1, 1, 'Rabies', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'clinic'),
      (2, 2, 'FVRCP', DATE_SUB(CURDATE(), INTERVAL 6 MONTH), DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'clinic'),
      (3, 3, 'Rabies', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'clinic')
    `);
    console.log(" Vaccination Records inserted");

    // Sample Adoption Requests
    console.log("\nPopulating adoption requests...");
    await connection.execute(`
      INSERT IGNORE INTO adoption_request (stray_id, adopter_id, status) VALUES
      (3, 1, 'pending'),
      (2, 2, 'approved'),
      (1, 3, 'pending')
    `);
    console.log(" Adoption Requests inserted");

    // Sample Incident Reports
    console.log("\nPopulating incident reports...");
    await connection.execute(`
      INSERT IGNORE INTO incident_report (owner_id, report_type, description, location, status) VALUES
      (1, 'stray', 'Brown aspin roaming near school gate', 'Manggahan High School, Pasig City', 'pending_verification'),
      (2, 'bite', 'Child bitten by unknown dog', 'Brgy. Socorro covered court, QC', 'in_progress'),
      (3, 'injured', 'Cat limping near tricycle terminal', 'Pavia Plaza, Iloilo', 'pending_verification')
    `);
    console.log(" Incident Reports inserted");

    // Sample Announcements
    console.log("\nPopulating announcements...");
    await connection.execute(`
      INSERT IGNORE INTO announcement (admin_id, title, content, language, status) VALUES
      (1, 'Free Anti-Rabies Clinic', 'Free anti-rabies vaccination for pets on Feb 14 at City Hall grounds.', 'en', 'published'),
      (2, 'Missing Dog Alert', 'Missing shih tzu named \"Mochi\" last seen near Cubao Expo.', 'en', 'published'),
      (1, 'Adoption Weekend', 'Visit the shelter this weekend to adopt fully vaccinated strays.', 'en', 'draft')
    `);
    console.log(" Announcements inserted");

    // Update pet_count for owners based on pets
    console.log("\nUpdating pet_count for pet owners...");
    await connection.execute(`
      UPDATE pet_owner po
      SET pet_count = (
        SELECT COUNT(*) FROM pet p WHERE p.owner_id = po.owner_id
      )
    `);
    console.log(" pet_count updated");

    console.log("\n========================================");
    console.log(" All sample data populated successfully!");
    console.log("========================================");

    await connection.end();
  } catch (error) {
    console.error("Error populating sample data:", error.message);
    if (error.code === "ER_DUP_ENTRY") {
      console.log("\nℹ Some records already exist (duplicates were skipped)");
    }
    process.exit(1);
  }
}

populateSampleData();
