import { pool } from "./config/database.js";
import Logger from "./utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = new Logger("CLINIC_MAP_SETUP");

async function setupClinicMapDatabase() {
  try {
    logger.info("Starting clinic map database setup...");

    // Create tables directly using pool.query
    logger.info("Creating clinic_map_view table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_map_view (
        view_id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT NOT NULL,
        viewed_by INT NULL,
        view_type ENUM('map', 'list', 'detail') DEFAULT 'map',
        view_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_map_view_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
        CONSTRAINT fk_map_view_admin FOREIGN KEY (viewed_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
        INDEX idx_map_view_clinic (clinic_id),
        INDEX idx_map_view_date (view_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    logger.info("Creating clinic_location_history table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_location_history (
        history_id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT NOT NULL,
        old_latitude DECIMAL(10, 8),
        old_longitude DECIMAL(11, 8),
        new_latitude DECIMAL(10, 8),
        new_longitude DECIMAL(11, 8),
        old_address VARCHAR(255),
        new_address VARCHAR(255),
        old_barangay VARCHAR(100),
        new_barangay VARCHAR(100),
        changed_by INT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reason TEXT,
        
        CONSTRAINT fk_location_history_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
        CONSTRAINT fk_location_history_admin FOREIGN KEY (changed_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
        INDEX idx_location_history_clinic (clinic_id),
        INDEX idx_location_history_date (changed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    logger.info("Creating clinic_inspection_report table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_inspection_report (
        inspection_id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT NOT NULL,
        inspector_id INT NOT NULL,
        inspection_date DATE NOT NULL,
        inspection_type ENUM('Initial', 'Routine', 'Follow-up', 'Complaint-based') DEFAULT 'Routine',
        
        facilities_score INT DEFAULT 0,
        equipment_score INT DEFAULT 0,
        hygiene_score INT DEFAULT 0,
        staff_qualifications_score INT DEFAULT 0,
        record_keeping_score INT DEFAULT 0,
        overall_score INT DEFAULT 0,
        
        inspection_result ENUM('Passed', 'Passed with Conditions', 'Failed') DEFAULT 'Passed',
        follow_up_required BOOLEAN DEFAULT FALSE,
        follow_up_date DATE,
        
        findings TEXT,
        recommendations TEXT,
        violations TEXT,
        
        photos JSON,
        documents JSON,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_inspection_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
        CONSTRAINT fk_inspection_inspector FOREIGN KEY (inspector_id) REFERENCES administrator(admin_id) ON DELETE CASCADE,
        INDEX idx_inspection_clinic (clinic_id),
        INDEX idx_inspection_date (inspection_date),
        INDEX idx_inspection_result (inspection_result)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    logger.info("Creating clinic_permit_renewal table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_permit_renewal (
        renewal_id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT NOT NULL,
        permit_type ENUM('Business Permit', 'Veterinary License', 'Accreditation') NOT NULL,
        
        previous_permit_number VARCHAR(100),
        previous_expiry_date DATE,
        
        new_permit_number VARCHAR(100),
        new_issue_date DATE,
        new_expiry_date DATE,
        
        renewal_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        applied_date DATE NOT NULL,
        processed_by INT,
        processed_date DATE,
        
        notes TEXT,
        rejection_reason TEXT,
        
        documents JSON,
        
        CONSTRAINT fk_renewal_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
        CONSTRAINT fk_renewal_processor FOREIGN KEY (processed_by) REFERENCES administrator(admin_id) ON DELETE SET NULL,
        INDEX idx_renewal_clinic (clinic_id),
        INDEX idx_renewal_status (renewal_status),
        INDEX idx_renewal_expiry (new_expiry_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    logger.info("Creating clinic_complaint table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinic_complaint (
        complaint_id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT NOT NULL,
        complainant_name VARCHAR(150),
        complainant_contact VARCHAR(20),
        complainant_email VARCHAR(150),
        
        complaint_type ENUM('Service Quality', 'Misconduct', 'Facilities', 'Pricing', 'Other') NOT NULL,
        complaint_description TEXT NOT NULL,
        incident_date DATE,
        
        status ENUM('Pending', 'Under Investigation', 'Resolved', 'Dismissed') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        
        assigned_to INT,
        investigation_notes TEXT,
        resolution_notes TEXT,
        resolution_date DATE,
        
        evidence_files JSON,
        
        filed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_complaint_clinic FOREIGN KEY (clinic_id) REFERENCES private_clinic(clinic_id) ON DELETE CASCADE,
        CONSTRAINT fk_complaint_assignee FOREIGN KEY (assigned_to) REFERENCES administrator(admin_id) ON DELETE SET NULL,
        INDEX idx_complaint_clinic (clinic_id),
        INDEX idx_complaint_status (status),
        INDEX idx_complaint_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Verify tables were created
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'cityvetcare_db' 
      AND TABLE_NAME IN (
        'clinic_map_view',
        'clinic_location_history',
        'clinic_inspection_report',
        'clinic_permit_renewal',
        'clinic_complaint'
      )
    `);

    logger.info("Tables created/verified:");
    tables.forEach((table) => {
      logger.info(`  ✓ ${table.TABLE_NAME}`);
    });

    // Get statistics
    const [clinicStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_clinics,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_clinics,
        SUM(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) as mappable_clinics
      FROM private_clinic
    `);

    logger.info("\nClinic Statistics:");
    logger.info(`  Total Clinics: ${clinicStats[0].total_clinics}`);
    logger.info(`  Active Clinics: ${clinicStats[0].active_clinics}`);
    logger.info(`  Mappable Clinics: ${clinicStats[0].mappable_clinics}`);

    logger.success("\n✓ Clinic map database setup completed successfully!");
  } catch (error) {
    logger.error("Error setting up clinic map database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup
setupClinicMapDatabase().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
